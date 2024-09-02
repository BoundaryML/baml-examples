<script setup lang="ts">
import { ref } from "vue";
import { extractResume } from "~/server/extract.get";

const result = ref(null);
const loading = ref(true);

const fetchResult = async () => {
  try {
    result.value = await extractResume();
    console.log("result frontend", result.value);
  } catch (error) {
    console.error("Error fetching result:", error);
  } finally {
    loading.value = false;
  }
};

fetchResult();

useHead({
  title: () => (loading.value ? "Loading" : "Resume Extraction"),
});
</script>

<template>
  <div>
    <h1>Resume Extraction</h1>
    <p v-if="loading">Loading...</p>
    <p v-else-if="result">Result: {{ result }}</p>
    <p v-else>No result available</p>
    <NuxtWelcome />
  </div>
</template>
