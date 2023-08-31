import { defineComponent, onMounted, ref } from 'vue'
import { GT_COMMENT } from '@/constant'
import { queryParse, queryStringify } from '@/utils'
import { shuimoJSON } from '@/request'
import { setState, state } from '@/store'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'Gitalk',
  props: {
    options: {
      type: Object as PropType<GitalkOptions>,
      required: true,
    },
  },
  setup(props) {
    setState<GitalkState, 'options'>(state, 'options', props.options)

    const accessToken = ref('')

    state.pagerDirection = state.options.pagerDirection || 'last'
    const storedComment = localStorage.getItem(GT_COMMENT)
    if (storedComment) {
      state.comment = storedComment
      window.localStorage.removeItem(GT_COMMENT)
    }

    onMounted(async () => {
      const query = queryParse<{ code?: string }>()
      if (query.code) {
        const code = query.code
        delete query.code
        const replacedUrl = `${window.location.origin}${
          window.location.pathname
        }?${queryStringify(query)}${window.location.hash}`
        history.replaceState(null, '', replacedUrl)
        state.options = Object.assign(
          {},
          {
            url: replacedUrl,
            id: replacedUrl,
          },
          props.options
        )

        const accessRes = await shuimoJSON.post<{
          access_token: string
        }>(state.options.proxy as string, {
          code,
          client_id: state.options.clientID,
          client_secret: state.options.clientSecret,
        })

        if (accessRes.data) {
          const { access_token } = accessRes.data
          if (access_token) {
            accessToken.value = access_token
          }
        }
      }
    })
    return () => <div class="content">content</div>
  },
})
