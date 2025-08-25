
<template>
  <div class="card-container" :style="{ '--surface-color': surfaceColor, '--curve': curve + 'px' }">
    <ul class="card-list">
      <li v-for="(card, index) in cards" :key="index">
        <a href="#" class="card">
          <img :src="card.image" class="card__image" alt="" />
          <div class="card__overlay">
            <div class="card__header">
              <svg class="card__arc" xmlns="http://www.w3.org/2000/svg">
                <path />
              </svg>
              <img :src="card.thumb" class="card__thumb" alt="" />
              <div class="card__header-text">
                <h3 class="card__title">{{ card.title }}</h3>
                <span v-if="card.tagline" class="card__tagline">{{ card.tagline }}</span>
                <span class="card__status">{{ card.status }}</span>
              </div>
            </div>
            <p class="card__description">{{ card.description }}</p>
          </div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
const surfaceColor = '#fff'
const curve = 40
const cards = [
  {
    image: 'https://i.imgur.com/oYiTqum.jpg',
    thumb: 'https://i.imgur.com/7D7I6dI.png',
    title: 'Jessica Parker',
    status: '1 hour ago',
    tagline: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
  },
  {
    image: 'https://i.imgur.com/2DhmtJ4.jpg',
    thumb: 'https://i.imgur.com/sjLMNDM.png',
    title: 'Kim Cattrall',
    status: '3 hours ago',
    tagline: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
  },
  {
    image: 'https://i.imgur.com/oYiTqum.jpg',
    thumb: 'https://i.imgur.com/7D7I6dI.png',
    title: 'Jessica Parker',
    status: '1 hour ago',
    tagline: 'Lorem ipsum dolor sit amet consectetur',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
  },
  {
    image: 'https://i.imgur.com/2DhmtJ4.jpg',
    thumb: 'https://i.imgur.com/sjLMNDM.png',
    title: 'Kim Cattrall',
    status: '3 hours ago',
    tagline: null,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores, blanditiis?',
  },
]
</script>

<style scoped>
:root {
  --surface-color: #fff;
  --curve: 40;
}

.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 4rem 5vw;
  padding: 0;
  list-style-type: none;
}

.card {
  position: relative;
  display: block;
  height: 100%;
  border-radius: calc(var(--curve) * 1px);
  overflow: hidden;
  text-decoration: none;
  background-color: white;
}

.card__image {
  width: 100%;
  height: auto;
}

.card__overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  border-radius: calc(var(--curve) * 1px);
  background-color: var(--surface-color);
  transform: translateY(100%);
  transition: 0.2s ease-in-out;
}

.card:hover .card__overlay {
  transform: translateY(0);
}

.card__header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2em;
  padding: 2em;
  border-radius: calc(var(--curve) * 1px) 0 0 0;
  background-color: var(--surface-color);
  transform: translateY(-100%);
  transition: 0.2s ease-in-out;
}

.card:hover .card__header {
  transform: translateY(0);
}

.card__arc {
  width: 80px;
  height: 80px;
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1;
}

.card__arc path {
  fill: var(--surface-color);
  d: path('M 40 80 c 22 0 40 -22 40 -40 v 40 Z');
}

.card__thumb {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.card__title {
  font-size: 1em;
  margin: 0 0 0.3em;
  color: #6a515e;
}

.card__tagline {
  display: block;
  margin: 1em 0;
  font-size: 0.8em;
  color: #d7bdca;
}

.card__status {
  font-size: 0.8em;
  color: #d7bdca;
}

.card__description {
  padding: 0 2em 2em;
  margin: 0;
  color: #d7bdca;
  font-size: 0.8em;
  display: -webkit-box;
  --webkit-box-orient: vertical;
  --webkit-line-clamp: 3;
  overflow: hidden;
}
</style>
