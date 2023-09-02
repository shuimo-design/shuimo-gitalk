import { createApp } from 'vue'
import GitalkComponent from './components/Gitalk'
import './gitalk.css'

class Gitalk {
  private _options: GitalkOptions

  constructor(options: GitalkOptions) {
    this._options = options
  }

  render(container: HTMLElement | string) {
    return createApp(GitalkComponent, {
      options: this._options,
    }).mount(container)
  }
}

export default Gitalk

export { GitalkComponent }
