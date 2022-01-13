#!/bin/sh

BEFORE_MAJ=21
BEFORE_MIN=18
IFS=_ read -r maj min
if [ "$maj" -lt "$BEFORE_MAJ" ]; then
  echo "${maj}_${min}"
elif [ "$maj" -eq "$BEFORE_MAJ" ]; then
  if [ "$min" -lt "$BEFORE_MIN" ]; then
    echo "${maj}_${min}"
  else
    echo "21_18"
  fi
else
  echo "21_18"
fi
