<template>
  <Teleport to="body">
    <div
      ref="pickerElement"
      class="reaction-picker"
      :class="[direction, { expanded }]"
      role="menu"
      @click.stop
      @pointerdown.stop
    >
      <div class="quick-reactions">
      <button
        v-for="emoji in QUICK_REACTIONS"
        :key="emoji"
        type="button"
        class="emoji-button"
        :class="{ active: currentEmoji === emoji }"
        :disabled="loading"
        :aria-label="`Reaction ${emoji}`"
        @click="selectEmoji(emoji)"
      >
        {{ emoji }}
      </button>
      <button
        type="button"
        class="emoji-button expand-button"
        :class="{ active: expanded }"
        :disabled="loading"
        aria-label="Lihat semua emoji"
        title="Emoji lainnya"
        @click="expanded = !expanded"
      >
        {{ expanded ? '−' : '+' }}
      </button>
      <button
        v-if="currentEmoji"
        type="button"
        class="emoji-button remove-button"
        :disabled="loading"
        aria-label="Hapus reaction"
        title="Hapus reaction"
        @click="selectEmoji('')"
      >
        ×
      </button>
      </div>

      <template v-if="expanded">
        <div class="category-tabs" role="tablist" aria-label="Kategori emoji">
        <button
          v-for="category in EMOJI_CATEGORIES"
          :key="category.id"
          type="button"
          class="category-button"
          :class="{ active: activeCategory === category.id }"
          :title="category.label"
          :aria-label="category.label"
          :aria-selected="activeCategory === category.id"
          role="tab"
          @click="activeCategory = category.id"
        >
          {{ category.icon }}
        </button>
        </div>

        <div class="emoji-grid" role="tabpanel">
        <button
          v-for="emoji in activeEmojis"
          :key="emoji"
          type="button"
          class="emoji-button grid-emoji"
          :class="{ active: currentEmoji === emoji }"
          :disabled="loading"
          :aria-label="`Reaction ${emoji}`"
          @click="selectEmoji(emoji)"
        >
          {{ emoji }}
        </button>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { calculateFloatingPosition } from '../utils/floatingPosition.js';

const props = defineProps({
  currentEmoji: { type: String, default: '' },
  direction: { type: String, default: 'incoming' },
  loading: { type: Boolean, default: false },
  anchorElement: { default: null },
  boundaryElement: { default: null },
});

const emit = defineEmits(['select']);
const expanded = ref(false);
const activeCategory = ref('faces');
const pickerElement = ref(null);
let resizeObserver = null;
let positionFrame = null;

const updatePosition = () => {
  const picker = pickerElement.value;
  const anchor = props.anchorElement;
  const boundary = props.boundaryElement;
  if (!picker || !anchor || !boundary) return;

  const anchorRect = anchor.getBoundingClientRect();
  const boundaryRect = boundary.getBoundingClientRect();
  const edgeGap = 12;
  const anchorGap = 8;
  const availableWidth = Math.max(0, boundaryRect.width - edgeGap * 2);
  const availableHeight = Math.max(0, boundaryRect.height - edgeGap * 2);

  picker.style.visibility = 'hidden';
  picker.style.maxWidth = `${availableWidth}px`;
  picker.style.maxHeight = `${availableHeight}px`;
  picker.style.width = expanded.value ? `${Math.min(320, availableWidth)}px` : 'max-content';

  const pickerRect = picker.getBoundingClientRect();
  const { left, top } = calculateFloatingPosition({
    anchorRect,
    boundaryRect,
    pickerRect,
    direction: props.direction,
    edgeGap,
    anchorGap,
  });

  picker.style.left = `${Math.round(left)}px`;
  picker.style.top = `${Math.round(top)}px`;
  picker.style.visibility = 'visible';
};

const schedulePositionUpdate = () => {
  if (positionFrame) cancelAnimationFrame(positionFrame);
  positionFrame = requestAnimationFrame(updatePosition);
};

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const EMOJI_CATEGORIES = [
  {
    id: 'faces',
    label: 'Ekspresi',
    icon: '😀',
    emojis: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥸 🤩 🥳 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🫣 🤭 🫢 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕'.split(' '),
  },
  {
    id: 'gestures',
    label: 'Gestur',
    icon: '👋',
    emojis: '👋 🤚 🖐️ ✋ 🖖 🫱 🫲 🫳 🫴 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 🫵 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 🫶 👐 🤲 🤝 🙏 ✍️ 💅 🤳 💪 🦾 🦵 🦶 👂 👃 👀 👁️ 🧠 🫀 🫁 🗣️ 👤 👥 🫂'.split(' '),
  },
  {
    id: 'hearts',
    label: 'Hati dan perasaan',
    icon: '❤️',
    emojis: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❤️‍🔥 ❤️‍🩹 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💌 💋 💯 💢 💥 💫 💦 💨 🕳️ 💣 💬 👁️‍🗨️ 🗨️ 🗯️ 💭 💤'.split(' '),
  },
  {
    id: 'people',
    label: 'Orang',
    icon: '🙋',
    emojis: '👶 🧒 👦 👧 🧑 👱 👨 🧔 👩 🧓 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 👷 💂 🕵️ 👩‍⚕️ 👨‍🎓 👩‍🏫 👨‍⚖️ 👩‍🌾 👨‍🍳 👩‍🔧 👨‍💻 👩‍🎨 👨‍🚀 👩‍🚒 🧙 🧚 🧛 🧜 🧝 🧞 🧟 🧘 🛀 🛌 🚶 🏃 💃 🕺'.split(' '),
  },
  {
    id: 'animals',
    label: 'Hewan dan alam',
    icon: '🐶',
    emojis: '🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🪳 🦟 🦗 🕷️ 🦂 🐢 🐍 🦎 🐙 🦑 🦀 🐠 🐟 🐬 🐳 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🦏 🐪 🦒 🦘 🦬 🐄 🐎 🐖 🐑 🦙 🐐 🦌 🐕 🐈 🪶 🌵 🎄 🌲 🌳 🌴 🌱 🌿 ☘️ 🍀 🍁 🍂 🍃 🌷 🌹 🌺 🌸 🌼 🌻 🌞 🌝 🌚 ⭐ 🌟 ✨ ⚡ 🔥 🌈 ☀️ ☁️ 🌧️ ❄️'.split(' '),
  },
  {
    id: 'food',
    label: 'Makanan',
    icon: '🍔',
    emojis: '🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶️ 🫑 🌽 🥕 🫒 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🥩 🍗 🍖 🌭 🍔 🍟 🍕 🫓 🥪 🌮 🌯 🫔 🥙 🧆 🍜 🍝 🍣 🍱 🍛 🍚 🍙 🍘 🥟 🍤 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 ☕ 🍵 🧃 🥤 🧋 🍺 🍻 🥂'.split(' '),
  },
  {
    id: 'activities',
    label: 'Aktivitas',
    icon: '⚽',
    emojis: '⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🥅 🏒 🏑 🥍 🏏 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧗 🏆 🥇 🥈 🥉 ⚡ 🎯 🎮 🕹️ 🎲 🧩 ♟️ 🎨 🎭 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎬 📸'.split(' '),
  },
  {
    id: 'symbols',
    label: 'Simbol',
    icon: '✅',
    emojis: '✅ ❌ ❓ ❗ ‼️ ⁉️ ⭕ 🚫 💯 🔥 ✨ 🎉 🎊 🚀 💡 📌 📍 🔔 🔕 ⭐ 🌟 ⚠️ ☢️ ☣️ ⬆️ ↗️ ➡️ ↘️ ⬇️ ↙️ ⬅️ ↖️ ↕️ ↔️ 🔄 ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ 🔀 🔁 🔂 ➕ ➖ ➗ ✖️ ♾️ ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲'.split(' '),
  },
];

const activeEmojis = computed(
  () => EMOJI_CATEGORIES.find(category => category.id === activeCategory.value)?.emojis || [],
);

const selectEmoji = emoji => emit('select', emoji);

watch(
  () => [props.anchorElement, props.boundaryElement, props.direction],
  async () => {
    await nextTick();
    schedulePositionUpdate();
  },
);

watch(expanded, async () => {
  await nextTick();
  schedulePositionUpdate();
});

onMounted(async () => {
  await nextTick();
  schedulePositionUpdate();
  window.addEventListener('resize', schedulePositionUpdate);

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(schedulePositionUpdate);
    if (pickerElement.value) resizeObserver.observe(pickerElement.value);
    if (props.boundaryElement) resizeObserver.observe(props.boundaryElement);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', schedulePositionUpdate);
  resizeObserver?.disconnect();
  if (positionFrame) cancelAnimationFrame(positionFrame);
});
</script>

<style scoped>
.reaction-picker {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1400;
  visibility: hidden;
  width: max-content;
  box-sizing: border-box;
  margin: 0;
  padding: 6px;
  border: 1px solid var(--theme-border);
  border-radius: 999px;
  background: var(--theme-surface);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
}

.reaction-picker.expanded {
  display: flex;
  flex-direction: column;
  width: 320px;
  overflow: hidden;
  border-radius: 18px;
}

.quick-reactions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
  overflow: visible;
}

.emoji-button,
.category-button {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  transition: background 0.15s ease, transform 0.15s ease;
}

.emoji-button:hover,
.emoji-button.active,
.category-button:hover,
.category-button.active {
  background: var(--theme-info-soft);
  transform: scale(1.1);
}

.emoji-button:disabled { cursor: wait; opacity: 0.55; }
.expand-button { color: var(--theme-info-text); font-size: 24px; font-weight: 600; }
.remove-button { color: #ef4444; font-size: 22px; }

.category-tabs {
  display: flex;
  justify-content: space-between;
  gap: 2px;
  margin-top: 6px;
  padding: 6px 0;
  border-top: 1px solid #eef2f7;
  border-bottom: 1px solid #eef2f7;
  overflow-x: hidden;
}

.category-button {
  width: 30px;
  height: 30px;
  flex-basis: 30px;
  font-size: 17px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(28px, 1fr));
  gap: 3px;
  min-height: 80px;
  max-height: 190px;
  margin-top: 6px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
}

.grid-emoji { width: 100%; }

@media (max-width: 520px) {
  .reaction-picker { padding: 5px; }
  .reaction-picker.expanded { width: 292px; }
  .quick-reactions { gap: 1px; }
  .quick-reactions .emoji-button {
    width: 29px;
    height: 29px;
    flex-basis: 29px;
    font-size: 18px;
  }
  .emoji-grid { grid-template-columns: repeat(7, minmax(28px, 1fr)); }
}
</style>
