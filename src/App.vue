<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import Config from "@/models/config";

import { Icon } from "@vicons/utils";
import {
  OverflowMenuHorizontal,
  Home,
  ChevronLeft,
  Close,
} from "@vicons/carbon";

const loading = ref(true);
Config.preload().then(() => {
  loading.value = false;
});

const longTermEntries = computed(
  () =>
    (Config.global && Config.global.entries.filter((e) => e).reverse()) || []
);
const shortTermEntries = computed(
  () =>
    (Config.global &&
      Config.global.shortTermEntries.filter((e) => e).reverse()) ||
    []
);

const showAside = ref(true);

async function removeST(entry) {
  const g = Config.global;
  g.stIds.remove(entry.id);
  await g.update();
}

async function removeLT(entry) {
  const g = Config.global;
  g.entryIds.remove(entry.id);
  await g.update();
}
</script>

<template>
  <div style="display: flex">
    <aside v-if="showAside">
      <a href="#" @click.prevent="showAside = false" style="float: right">
        <Icon><ChevronLeft /></Icon>
      </a>
      <router-link to="/entries">
        <Icon><Home /></Icon>
      </router-link>

      <ul v-if="!loading" class="menus">
        <li v-for="entry in longTermEntries" :key="entry.id">
          <div>
            <router-link
              :key="entry.id"
              :to="`/entries/${entry.id}`"
              class="btn"
            >
              {{ entry.title }}
            </router-link>
            <a href="" class="del btn" @click.prevent="removeLT(entry)">
              <Icon><Close /></Icon>
            </a>
          </div>
        </li>
      </ul>
    </aside>
    <main>
      <div>
        <ul v-if="!loading" class="tabs">
          <li>
            <a href="#" @click.prevent="showAside = true">
              <Icon><OverflowMenuHorizontal /></Icon>
            </a>
          </li>
          <li v-for="entry in shortTermEntries" :key="entry.id">
            <router-link
              :key="entry.id"
              :to="`/entries/${entry.id}`"
              class="btn"
            >
              {{ entry.title }}
            </router-link>
            <a href="" class="del btn" @click.prevent="removeST(entry)">
              <Icon><Close /></Icon>
            </a>
          </li>
        </ul>
      </div>
      <div class="container">
        <router-view></router-view>
      </div>
      <footer></footer>
    </main>
  </div>
</template>

<style scoped>
.tabs {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  height: 2em;
}
.tabs li {
  margin: 0 4px;
  border-radius: 2px;
  display: flex;
}
.tabs li a {
  display: flex;
  align-items: center;

  text-decoration: none;
  padding: 0 4px;

  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tabs li a:hover {
  background: #eee;
}
</style>

<style>
body {
  overflow-y: scroll;
  margin: 0;
  padding: 0;
}
#app {
  --p-margin: 0.7rem;
  --p-margin: 0.25rem;
  --p-margin: 0;
  --color: #2c3e50;
  --color: rgb(55, 53, 47);
  --font-family: Avenir, Helvetica, Arial, sans-serif;
  --font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji",
    "Segoe UI Symbol";
  --font-size: 15px;
  --line-height: 1.5;

  color: var(--color);
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

aside {
  padding: 0.5em;
  flex: 0 0 280px;

  border-right: 1px solid rgb(204, 213, 221);
  background: #f5f7fa;
}

main {
  flex: 1;
}
main .container {
  max-width: 640px;
  max-width: 56rem;
  margin: 0 auto;
  padding: 0 2em;
}

a {
  color: var(--color);
}

textarea {
  color: var(--color);
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  -webkit-tap-highlight-color: transparent;
}

footer {
  height: calc(100vh - 6em);
}

::placeholder {
  /* Chrome, Firefox, Opera, Safari 10.1+ */
  color: #ccc;
  opacity: 1; /* Firefox */
}

.rel-path {
  font-style: italic;
  font-size: smaller;
}

ul.menus li > div {
  display: flex;
}

ul.menus li > div > a {
  display: block;
}

ul.menus li > div > a:first-child {
  flex: 1;
  margin-right: 2px;
}

ul.menus .btn {
  padding: 0 4px;
  border-radius: 2px;
}
ul.menus .btn:hover {
  background: #f5f7fa;
  background: #e5e8ed;
}

.btn.del {
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-mark {
  position: absolute;
  padding: 0.5em;
}

.nav-mark a {
  color: #ccc;
}
.nav-mark a:hover {
  color: var(--color);
}
</style>
