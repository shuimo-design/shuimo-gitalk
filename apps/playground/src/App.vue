<script setup lang="ts">
import Gitalk from 'shuimo-gitalk-vue'
onMounted(() => {
  const gitalk = new Gitalk({
    clientID: 'GitHub Application Client ID',
    clientSecret: 'GitHub Application Client Secret',
    repo: 'GitHub repo',
    owner: 'GitHub repo owner',
    admin: ['GitHub repo owner and collaborators, only these guys can initialize github issues'],
    id: location.pathname,      // Ensure uniqueness and length less than 50
    distractionFreeMode: false  // Facebook-like distraction free mode
  })
  gitalk.render('#gitalk-container')
})
</script>
<template>
  <div id="gitalk-container"></div>
</template>
