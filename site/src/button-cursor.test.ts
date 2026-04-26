import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { describe, test, expect } from 'vitest'
import ts from 'typescript'

const COMPONENTS_DIR = join(import.meta.dirname, 'components')

type Violation = {
  kind: 'missing-cursor' | 'no-classname' | 'dynamic-classname'
  line: number
  preview: string
}

function hasCursorClass(cls: string): boolean {
  return cls.includes('cursor-pointer') || cls.includes('cursor-not-allowed')
}

function checkFile(filename: string, source: string): Violation[] {
  const sourceFile = ts.createSourceFile(
    filename,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  const violations: Violation[] = []

  function location(node: ts.Node) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile))
    const preview = node.getText(sourceFile).replace(/\s+/g, ' ').slice(0, 80)
    return { line: line + 1, preview }
  }

  function visit(node: ts.Node) {
    const isButtonTag =
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(sourceFile) === 'button'

    if (isButtonTag) {
      const classNameAttr = node.attributes.properties.find(
        (p): p is ts.JsxAttribute =>
          ts.isJsxAttribute(p) && p.name.getText(sourceFile) === 'className',
      )

      if (!classNameAttr?.initializer) {
        violations.push({ kind: 'no-classname', ...location(node) })
        return
      }

      const init = classNameAttr.initializer

      if (ts.isStringLiteral(init)) {
        if (!hasCursorClass(init.text)) {
          violations.push({ kind: 'missing-cursor', ...location(node) })
        }
        return
      }

      if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteral(init.expression)) {
        if (!hasCursorClass(init.expression.text)) {
          violations.push({ kind: 'missing-cursor', ...location(node) })
        }
        return
      }

      // Dynamic expression — static analysis can't verify the cursor class; requires manual review
      violations.push({ kind: 'dynamic-classname', ...location(node) })
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return violations
}

describe('button cursor classes', () => {
  const files = readdirSync(COMPONENTS_DIR).filter((f) => f.endsWith('.tsx'))

  for (const file of files) {
    const source = readFileSync(join(COMPONENTS_DIR, file), 'utf8')

    test(file, () => {
      const violations = checkFile(file, source)
      expect(violations).toEqual([])
    })
  }
})
