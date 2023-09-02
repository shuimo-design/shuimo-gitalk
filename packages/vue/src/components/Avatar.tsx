import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Avatar',
  props: {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    className: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const defaultSrc =
      '//github.com/shuimo-design/shuimo-gitalk/blob/main/logo.svg'
    return () => (
      <div class={`gt-avatar ${props.className}`}>
        <img src={props.src || defaultSrc} alt={`@${props.alt}`} />
      </div>
    )
  },
})
