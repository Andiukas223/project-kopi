<script setup>
import VmButton from "./VmButton.vue";

defineProps({
  ariaHidden: {
    type: String,
    default: "true"
  },
  backId: {
    type: String,
    default: "wiz-back"
  },
  backLabel: {
    type: String,
    default: "Back"
  },
  closeAriaLabel: {
    type: String,
    default: "Close wizard"
  },
  closeId: {
    type: String,
    default: "wiz-close"
  },
  contentId: {
    type: String,
    default: "wiz-content"
  },
  countId: {
    type: String,
    default: "wiz-count"
  },
  countLabel: {
    type: String,
    default: "1 / 8"
  },
  nextId: {
    type: String,
    default: "wiz-next"
  },
  nextLabel: {
    type: String,
    default: "Continue"
  },
  overlayId: {
    type: String,
    required: true
  },
  stepsAriaLabel: {
    type: String,
    default: "Workflow steps"
  },
  stepsId: {
    type: String,
    default: "wiz-steps"
  },
  subtitle: {
    type: String,
    default: ""
  },
  subtitleId: {
    type: String,
    default: "wiz-subtitle"
  },
  title: {
    type: String,
    required: true
  },
  titleId: {
    type: String,
    default: "wiz-title"
  }
});
</script>

<template>
  <div class="wiz-overlay" :id="overlayId" :aria-hidden="ariaHidden">
    <section class="wiz-dialog" role="dialog" aria-modal="true" :aria-labelledby="titleId">
      <div class="wiz-head">
        <div>
          <h2 :id="titleId">{{ title }}</h2>
          <p :id="subtitleId">{{ subtitle }}</p>
        </div>
        <button class="wiz-close" type="button" :id="closeId" :aria-label="closeAriaLabel">x</button>
      </div>
      <div class="wiz-body">
        <div class="wiz-steps" :id="stepsId" :aria-label="stepsAriaLabel"></div>
        <div class="wiz-content" :id="contentId"></div>
      </div>
      <div class="wiz-footer">
        <VmButton variant="ghost" :id="backId">{{ backLabel }}</VmButton>
        <div class="wiz-footer-right">
          <span :id="countId">{{ countLabel }}</span>
          <VmButton variant="dark" :id="nextId">{{ nextLabel }}</VmButton>
        </div>
      </div>
    </section>
  </div>
</template>
