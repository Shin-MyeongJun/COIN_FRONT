import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export class ChartErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : '차트를 불러올 수 없습니다.',
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="chart-error" role="alert">
          <span aria-hidden="true">⚠</span>
          <p>차트 렌더링 실패: {this.state.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
