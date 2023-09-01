import { defineComponent, onMounted, ref } from 'vue'
import { GT_COMMENT } from '@/constant'
import { queryParse, queryStringify } from '@/utils'
import { formatErrorMsg, shuimoJSON } from '@/shuimoRequest'
import { setState, state } from '@/store'
import useInit from '@/composables/useInit'
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
    state.options = {
      ...state.options,
      ...props.options,
    }

    const accessToken = ref('')

    state.pagerDirection = state.options.pagerDirection || 'last'
    const storedComment = localStorage.getItem(GT_COMMENT)
    if (storedComment) {
      state.comment = storedComment
      window.localStorage.removeItem(GT_COMMENT)
    }

    const { getUserInfo, getIssue, getComments } = useInit(accessToken)

    const init = async () => {
      try {
        await getUserInfo()
        const issue = await getIssue()
        if (issue) {
          await getComments(issue)
        }
      } catch (err) {
        console.log(err)
      }
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
        state.options = {
          ...state.options,
          url: replacedUrl,
          id: replacedUrl,
          ...props.options,
        }

        const accessRes = await shuimoJSON
          .post<{
            access_token: string
          }>(state.options.proxy as string, {
            code,
            client_id: state.options.clientID,
            client_secret: state.options.clientSecret,
          })
          .catch((err) => {
            state.isOccurError = false
            state.errorMsg = formatErrorMsg(err)
          })

        if (accessRes && accessRes.data) {
          const { access_token } = accessRes.data
          if (access_token) {
            accessToken.value = access_token
            await init().catch((err) => {
              state.isIniting = false
              state.isOccurError = false
              state.errorMsg = formatErrorMsg(err)
            })
            state.isIniting = false
          }
        } else {
          state.isOccurError = false
          state.errorMsg = formatErrorMsg(new Error('no access token'))
        }
      } else {
        await init().catch((err) => {
          state.isIniting = false
          state.isOccurError = false
          state.errorMsg = formatErrorMsg(err)
        })
        state.isIniting = false
      }
    })
    return () => <div class="content">content</div>
  },
})
