import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <div className="corpus-error" role="alert"><h1>Sahifani ochib bo‘lmadi / Unable to display this page</h1><p>Qayta yuklab ko‘ring. / Please reload and try again.</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Qayta yuklash / Reload</button></div>
    return this.props.children
  }
}
