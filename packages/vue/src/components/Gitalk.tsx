import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Gitalk',
  props: {
    options: {
      type: Object,
      required: true
    }
  },
  setup(props) {}
})
