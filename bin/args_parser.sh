#!/usr/bin/env bash

# Common args parser. Add "source bin/lint_args_parser.sh" then make your script 
# do whatever it needs to do based on the flags set below
OTHER_ARGS=()
while [[ "${#}" -gt 0 ]]; do
  case "${1}" in
    --quick|-q)
      ARG_QUICK="true"
      shift
      ;;

    --fix|-f)
      ARG_FIX="true"
      shift
      ;;

    --no-prettify|-np)
      NO_PRETTIFY="true"
      shift
      ;;

    --junit-reporter|-j)
      JUNIT_REPORTER="true"
      shift
      ;;

    --staged|-st)
      ARG_STAGED="true"
      shift
      ;;

    --help|-h)
      cat <<HELP
Basic Usage: ${0}
Advanced Usage: ${0} [options]

Options:
  --quick -q           Only check changed files
  --fix -f             Automatically fix issues
  --staged -st         Only check staged files (if the process supports it)
  --help -h            Print this message
HELP

      exit 0
      ;;

    *)
      # Unexpected lint option $1 for $0. 📖 Use $0 --help for usage.
      # Assuming this should be passed through to $0
      OTHER_ARGS+=("$1")
      shift
  esac
done

# Set defaults if not set by flags
ARG_FIX="${ARG_FIX:-false}"
ARG_QUICK="${ARG_QUICK:-false}"
NO_PRETTIFY="${NO_PRETTIFY:-false}"
JUNIT_REPORTER="${JUNIT_REPORTER:-false}"
ARG_STAGED="${ARG_STAGED:-false}"

# Export them
export ARG_FIX
export ARG_QUICK
export NO_PRETTIFY
export JUNIT_REPORTER
export ARG_STAGED
export OTHER_ARGS
