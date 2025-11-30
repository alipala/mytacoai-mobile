const React = require('react');
try {
  console.log('Testing import...');
  const component = require('./src/components/CreateLearningPlanModal.tsx');
  console.log('Component imported:', component);
} catch (e) {
  console.error('Import error:', e);
}
