
<script setup>
import { ref, onMounted } from 'vue'
import { useAnnouncementsStore } from '@/stores/eventStore.js'
import NavBar2 from '@/components/layout/NavBar2.vue'
import AppBar from '@/components/layout/AppBar.vue'

const announcementsStore = useAnnouncementsStore()
const tableFilters = ref({
  search: '',
})

import { useDisplay } from 'vuetify'

const { mobile, smAndDown } = useDisplay()

// On page load, fetch announcements
onMounted(async () => {
  // Fetch announcements if they aren't already loaded
  if (announcementsStore.announcements.length === 0) {
    await announcementsStore.getAnnouncements(tableFilters.value)
  }
})
onMounted(() => {
  class TxtType {
    constructor(el, toRotate, period) {
      this.toRotate = toRotate
      this.el = el
      this.loopNum = 0
      this.period = parseInt(period, 10) || 2000
      this.txt = ''
      this.tick()
      this.isDeleting = false
    }

    tick() {
      const i = this.loopNum % this.toRotate.length
      const fullTxt = this.toRotate[i]

      this.txt = this.isDeleting
        ? fullTxt.substring(0, this.txt.length - 1)
        : fullTxt.substring(0, this.txt.length + 1)

      this.el.innerHTML = '<span class="wrap">' + this.txt + '</span>'

      let delta = 200 - Math.random() * 100
      if (this.isDeleting) delta /= 2

      if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period
        this.isDeleting = true
      } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false
        this.loopNum++
        delta = 500
      }

      setTimeout(() => this.tick(), delta)
    }
  }

  const elements = document.getElementsByClassName('typewrite')
  for (let i = 0; i < elements.length; i++) {
    const toRotate = elements[i].getAttribute('data-type')
    const period = elements[i].getAttribute('data-period')
    if (toRotate) {
      new TxtType(elements[i], JSON.parse(toRotate), period)
    }
  }
})
</script>

<template>
  <NavBar2>
    <template #content>
      <v-container fluid pa-0>
        <!--Background Image-->
        <div class="bg-wrapper">
          <v-responsive aspect-ratio="16/9">
            <video
              autoplay
              muted
              loop
              playsinline
              style="height: 100%; width: 100%; object-fit: cover"
            >
              <source src="/homepage-bg.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </v-responsive>
        </div>

        <v-row class="mt-10">
          <!-- Left Half: Video Background with Welcome Text -->

          <v-col cols="12" md="6" class="position-relative">
            <!-- Headline Top Left -->
            <div class="headline-container">
              <h1 class="text-top text-uppercase" :class="mobile ? 'small-text' : 'large-text'">
                Faith. Community. Worship.
                <div class="typewriter-container">
                  <a class="typewrite" data-period="2000" data-type='["Welcome to our website!"]'>
                    <span class="wrap"></span>
                  </a>
                </div>
              </h1>
            </div>

            <!-- Centered Text & Button -->
            <div class="content-container">
              <p class="text-left" :class="smAndDown ? 'small-p text-center' : 'large-p'">
                Easily book parish services and pick the perfect schedule for your special moment —
                anytime, online.
              </p>

              <RouterLink to="/book-event" class="router-link">
                <v-btn
                  class="btn-0 mt-4 rounded-pill button"
                  size="x-large"
                  variant="flat"
                  :class="smAndDown ? 'small-header' : 'large-header'"
                >
                  Book Now
                </v-btn>
              </RouterLink>
            </div>
          </v-col>
          <br />

          <v-col cols="12" md="6">
            <v-img src="gridpic.jpg" class="float-card"></v-img>
          </v-col>
        </v-row>
      </v-container>

      <AppBar />
    </template>
  </NavBar2>
</template>

<style scoped>
/* your CSS remains same */
.button {
  display: block;
  margin: 0 auto;
}
@keyframes float {
  0% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0);
  }
}

.float-card {
  animation: float 3s ease-in-out infinite;
}

.cardx {
  border-color: rgb(49, 49, 95);
}
.heart {
  background-color: whitesmoke;
}

body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

h1 {
  font-family: 'Jomolhari', serif;
  font-weight: 700;
  color: rgb(49, 49, 95);
}

.small-text {
  font-size: 30px;
  text-align: center;
}

.large-text {
  font-size: 3rem;
}

.bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
  padding-left: 40px;
  object-fit: cover;
}

p {
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  color: rgb(23, 26, 25);
}

.btn-0 {
  background-color: rgb(49, 49, 95);
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
  color: rgb(204, 195, 195);
  font-weight: bold;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.btn-0:hover {
  transform: translateY(-12px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.bg-wrapper > .v-responsive {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.card-shadow {
  box-shadow:
    -4px 0px 12px rgba(0, 0, 0, 0.1),
    4px 0px 12px rgba(0, 0, 0, 0.1),
    0px 4px 12px rgba(0, 0, 0, 0.1);
}

.typewrite {
  color: rgb(116, 39, 39);
  text-decoration: none;
}

.card-title {
  font-family: Cambria, Georgia, serif;
  font-weight: bolder;
  text-align: center;
}

.dates {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.text2 {
  font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}
.text-uppercase {
  text-transform: uppercase;
  font-weight: bold;
}

.text-left {
  padding-bottom: 60px;
  text-align: center;
}

.text-top {
  padding-bottom: 60px;
}

.headline-container {
  min-height: 120px; /* Reserve space for the headline */
  margin-bottom: 20px;
}

.typewriter-container {
  height: 40px; /* Fixed height for typewriter text */
  display: flex;
  align-items: center;
}

.content-container {
  margin-top: 20px;
}

.small-p {
  font-size: 20px;
  text-align: center;
}

.large-p {
  font-size: 22px;
}

.router-link {
  text-decoration: none;
  color: inherit;
}

.router-link:hover {
  text-decoration: none;
}
</style>
