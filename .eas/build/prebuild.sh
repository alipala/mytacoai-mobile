#!/bin/bash

# Copy google-services.json from EAS Secret if it exists
if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "$GOOGLE_SERVICES_JSON" > google-services.json
  echo "✅ google-services.json created from EAS Secret"
else
  echo "⚠️  GOOGLE_SERVICES_JSON secret not found"
fi
