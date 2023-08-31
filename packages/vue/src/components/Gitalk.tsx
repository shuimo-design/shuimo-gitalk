import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Gitalk',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    console.log(props)
    return () => <div class="content">content</div>
  }
})
