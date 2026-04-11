# Site

This is the web site for the high torque training sessions.

Specs, plans and a todo list for this site can be found in ../site-specification.

## Node version

This project uses `fnm` with `--use-on-cd` to manage Node versions. The required version is in `.nvmrc`. In non-interactive shells (like tool calls), activate it with:

```bash
export FNM_PATH="/home/jelen/.local/share/fnm" && export PATH="$FNM_PATH:$PATH" && eval "$(fnm env --use-on-cd --shell bash)"
```

## UX scope

Desktop only for now. Do not add responsive layouts, mobile breakpoints, or touch-specific interactions unless explicitly asked.
