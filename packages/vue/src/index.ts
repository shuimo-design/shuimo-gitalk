import { createApp } from 'vue'
import ShuimoGitalk from './components/Gitalk'
import './gitalk.css'

class Gitalk {
  private _options: GitalkOptions

  constructor(options: GitalkOptions) {
    this._options = options
  }

  render(container: HTMLElement | string) {
    return createApp(ShuimoGitalk, {
      options: this._options,
    }).mount(container)
  }
}

export default Gitalk

export { ShuimoGitalk }
