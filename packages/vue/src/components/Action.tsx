import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'Action',
  props: {
    text: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      default: () => {
        return
      },
    },
  },
  setup(props) {
    return () => (
      <a class={`gt-action ${props.className}`} onClick={props.onClick}>
        <span class="gt-action-text">{props.text}</span>
      </a>
    )
  },
})
