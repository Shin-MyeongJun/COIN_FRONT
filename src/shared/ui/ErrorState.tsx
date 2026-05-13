export function ErrorState({ message = '데이터를 불러오지 못했습니다.' }: { message?: string }) {
  return (
    <div className="error-state" role="alert">
      <span aria-hidden="true">⚠</span>
      <p>{message}</p>
    </div>
  )
}
