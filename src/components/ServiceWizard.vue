<script setup>
import VmWizardShell from "./ui/VmWizardShell.vue";
</script>

<template>
  <VmWizardShell
    overlay-id="service-wizard"
    title="New service job"
    subtitle="Step 1 of 8 - Customer"
    close-aria-label="Close service wizard"
    steps-aria-label="Service workflow steps"
  />
</template>
