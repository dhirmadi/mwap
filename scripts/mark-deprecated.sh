#!/bin/bash

# Add @deprecated tags to all exports in legacy code
find src/legacy -type f -name "*.ts" -not -name "*.d.ts" -exec sed -i '1i\/** @deprecated Use equivalent functionality from v2 modules instead. This module will be removed in a future release. *\/\n' {} \;