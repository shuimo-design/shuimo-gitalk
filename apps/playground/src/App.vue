<script setup lang="ts">
import Gitalk from 'shuimo-gitalk'
import 'shuimo-gitalk/dist/style.css'
onMounted(() => {
  const gitalk = new Gitalk({
    clientID: 'c0410a3281b1991b5b1b',
    clientSecret: '51115c75e7ddd21a621470b67911d47f30734902',
    repo: 'blog-talk', // The repository of store comments,
    owner: 'youuss',
    admin: ['youuss'],
    id: location.pathname, // Ensure uniqueness and length less than 50
    distractionFreeMode: false, // Facebook-like distraction free mode
  })
  gitalk.render('#gitalk-container')
})
</script>
<template>
  <div id="gitalk-container" />
</template>
<style>
#gitalk-container {
  max-width: 69vw;
  margin: 0 auto;
}
</style>
