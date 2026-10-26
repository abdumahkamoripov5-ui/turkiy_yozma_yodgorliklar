import { useState } from 'react'
import { useCopy } from '../mvp/copy'

export default function WordAudio({ word }) {
  const c = useCopy()
  const [failed, setFailed] = useState(false)
  if (!word.audio) return null
  return <section aria-label={c('Talaffuz audiosi', 'Аудиопроизношение', 'Audio pronunciation')}>
    <audio key={word.audio} controls preload="none" src={word.audio}
      style={{ maxWidth: '100%' }} onError={() => setFailed(true)}
      aria-label={c(`${word.word} talaffuzini tinglash`, `Произношение: ${word.word}`, `Listen to ${word.word}`)} />
    {failed && <p role="status">{c('Audio yuklanmadi. Keyinroq qayta urinib ko‘ring.', 'Не удалось загрузить аудио. Попробуйте позже.', 'Audio could not load. Please try again later.')}</p>}
    <p><small>{word.audio_demo
      ? c('AI yaratgan sinov audiosi. Tarixiy talaffuz mutaxassis tomonidan tekshirilmagan.', 'Пробное аудио ИИ. Историческое произношение не проверено специалистом.', 'AI audio demo. Historical pronunciation has not been reviewed by an expert.')
      : word.audio_kind === 'ai'
      ? c('AI yaratgan, talaffuzi tekshirilgan.', 'Создано ИИ, произношение проверено.', 'AI generated, pronunciation reviewed.')
      : c('Inson ovozi, talaffuzi tekshirilgan.', 'Голос человека, произношение проверено.', 'Human voice, pronunciation reviewed.')} {word.audio_credit}</small></p>
  </section>
}
