import { createApp } from 'vue'
import GitalkComponent from './components/Gitalk'

class Gitalk {
  private _options: GitalkOptions

  constructor(options: GitalkOptions) {
    this._options = options
  }

  render(constainer: HTMLElement | string) {
    return createApp(GitalkComponent, {
      options: this._options,
    }).mount(constainer)
  }
}

export default Gitalk
