import { useState } from 'react'
import jsPDF from 'jspdf'

function renderPreviews(files) {
  if (!files || !files.length) return null
  return (
    <div className="preview-row">
      {files.map((f, i) => {
        const url = URL.createObjectURL(f)
        return <img key={i} src={url} alt={f.name} style={{ maxWidth: 120, maxHeight: 90, marginRight: 8 }} />
      })}
    </div>
  )
}

async function filesToDataURLs(files) {
  const readers = files.map(
    (f) =>
      new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(r.result)
        r.onerror = rej
        r.readAsDataURL(f)
      }),
  )
  return Promise.all(readers)
}

export default function EvidenceForm() {
  const [scenarios, setScenarios] = useState([
    {
      id: Date.now(),
      applicationName: '',
      appType: 'frontend',
      url: '',
      title: '',
      description: '',
      screenshotsBefore: [],
      screenshotsAfter: [],
      requestBody: '',
      responseBody: '',
      observations: '',
    },
  ])
  const [activeIndex, setActiveIndex] = useState(0)

  function handleChange(e, index = activeIndex) {
    const { name, value } = e.target
    setScenarios((s) => {
      const copy = [...s]
      copy[index] = { ...copy[index], [name]: value }
      return copy
    })
  }

  function handleFiles(e, key, index = activeIndex) {
    const files = Array.from(e.target.files)
    setScenarios((s) => {
      const copy = [...s]
      copy[index] = { ...copy[index], [key]: files }
      return copy
    })
  }

  async function exportPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const margin = 40
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const usableWidth = pageWidth - margin * 2
    let y = margin

    const ensureSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
    }

    const addTitle = (text) => {
      doc.setFontSize(18)
      ensureSpace(30)
      doc.text(text, margin, y)
      y += 28
    }

    const addLabelValue = (label, value) => {
      const lineHeight = 14
      // title
      doc.setFontSize(12)
      doc.setFont(undefined, 'bold')
      ensureSpace(lineHeight + 8)
      doc.text(label, margin, y)
      y += lineHeight + 8

      // blank line
      y += 4

      doc.setFontSize(11)
      doc.setFont(undefined, 'normal')
      const text = value || '-'
      let lines = doc.splitTextToSize(text, usableWidth)

      while (lines.length > 0) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        const availLines = Math.floor((pageHeight - margin - y) / lineHeight)
        const chunkLines = lines.splice(0, Math.max(availLines, 1))
        doc.text(chunkLines, margin, y)
        y += chunkLines.length * lineHeight + 6
      }

      y += 10
    }

    for (let si = 0; si < scenarios.length; si++) {
      const form = scenarios[si]
      addTitle(form.applicationName ? form.applicationName : 'Evidence Collector')
      addLabelValue('Application type', form.appType)
      addLabelValue('URL', form.url)
      addLabelValue('Scenario title', form.title)
      addLabelValue('Scenario description', form.description)

      if (form.appType === 'frontend') {
        if (form.screenshotsBefore && form.screenshotsBefore.length) {
          doc.setFontSize(13)
          ensureSpace(20)
          doc.text('Screenshots - Before', margin, y)
          y += 18
          const dataUrls = await filesToDataURLs(form.screenshotsBefore)
          for (const d of dataUrls) {
            const imgProps = await new Promise((res) => {
              const img = new Image()
              img.onload = () => res({ w: img.width, h: img.height })
              img.src = d
            })
            const maxImgHeight = pageHeight - margin - 60
            const ratio = Math.min(usableWidth / imgProps.w, maxImgHeight / imgProps.h, 1)
            const drawW = imgProps.w * ratio
            const drawH = imgProps.h * ratio
            ensureSpace(drawH + 8)
            doc.addImage(d, 'JPEG', margin, y, drawW, drawH)
            y += drawH + 12
          }
          y += 6
        }

        if (form.screenshotsAfter && form.screenshotsAfter.length) {
          doc.setFontSize(13)
          ensureSpace(20)
          doc.text('Screenshots - After', margin, y)
          y += 18
          const dataUrls = await filesToDataURLs(form.screenshotsAfter)
          for (const d of dataUrls) {
            const imgProps = await new Promise((res) => {
              const img = new Image()
              img.onload = () => res({ w: img.width, h: img.height })
              img.src = d
            })
            const maxImgHeight = pageHeight - margin - 60
            const ratio = Math.min(usableWidth / imgProps.w, maxImgHeight / imgProps.h, 1)
            const drawW = imgProps.w * ratio
            const drawH = imgProps.h * ratio
            ensureSpace(drawH + 8)
            doc.addImage(d, 'JPEG', margin, y, drawW, drawH)
            y += drawH + 12
          }
          y += 6
        }
      } else {
        addLabelValue('Request body', form.requestBody)
        addLabelValue('Response body', form.responseBody)
      }

      addLabelValue('Observations', form.observations)

        if (si < scenarios.length - 1) {
        doc.addPage()
        y = margin
      }
    }

    if (y + 40 > pageHeight - margin) {
      doc.addPage()
      y = margin
    }

    doc.save(`evidence-${Date.now()}.pdf`)
  }

  return (
    <div className="evidence-form-wrapper">
      <h2>Evidence Collector</h2>

      <div style={{ marginBottom: 12 }}>
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveIndex(i)}
            style={{ marginRight: 8, padding: '6px 10px', background: i === activeIndex ? '#5366ff' : '#f0f2f7', color: i === activeIndex ? '#fff' : '#111', border: 'none', borderRadius: 6 }}
          >
            Scenario {i + 1}
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            setScenarios((s) => {
              const next = [
                ...s,
                {
                  id: Date.now() + Math.random(),
                  applicationName: '',
                  appType: 'frontend',
                  url: '',
                  title: '',
                  description: '',
                  screenshotsBefore: [],
                  screenshotsAfter: [],
                  requestBody: '',
                  responseBody: '',
                  observations: '',
                },
              ]
              // make the newly added scenario active
              setActiveIndex(next.length - 1)
              return next
            })
          }}
          style={{ padding: '6px 10px', borderRadius: 6 }}
        >
          + Add scenario
        </button>

        {scenarios.length > 1 && (
          <button
            type="button"
            onClick={() => {
              setScenarios((s) => s.filter((_, idx) => idx !== activeIndex))
              setActiveIndex((ai) => Math.max(0, ai - 1))
            }}
            style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 6, background: '#ffecec' }}
          >
            Remove
          </button>
        )}
      </div>

      <form className="evidence-form" onSubmit={(e) => { e.preventDefault(); exportPDF() }}>
        <div className="field">
          <label>Application Name</label>
          <input name="applicationName" value={scenarios[activeIndex].applicationName} onChange={(e) => handleChange(e, activeIndex)} />
        </div>

        <div className="field">
          <label>Choose application type</label>
          <select name="appType" value={(scenarios[activeIndex] && scenarios[activeIndex].appType) || 'frontend'} onChange={(e) => handleChange(e, activeIndex)}>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
          </select>
        </div>

        <div className="field">
          <label>URL</label>
          <input name="url" value={scenarios[activeIndex].url} onChange={(e) => handleChange(e, activeIndex)} />
        </div>

        <div className="field">
          <label>Scenario title</label>
          <input name="title" value={scenarios[activeIndex].title} onChange={(e) => handleChange(e, activeIndex)} />
        </div>

        <div className="field">
          <label>Scenario description</label>
          <textarea name="description" value={scenarios[activeIndex].description} onChange={(e) => handleChange(e, activeIndex)} />
        </div>

        {(scenarios[activeIndex] && scenarios[activeIndex].appType === 'frontend') ? (
          <>
            <div className="field">
              <label>Screenshots before change</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e, 'screenshotsBefore', activeIndex)} />
              {renderPreviews((scenarios[activeIndex] && scenarios[activeIndex].screenshotsBefore) || [])}
            </div>

            <div className="field">
              <label>Screenshots after feature implementation</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleFiles(e, 'screenshotsAfter', activeIndex)} />
              {renderPreviews((scenarios[activeIndex] && scenarios[activeIndex].screenshotsAfter) || [])}
            </div>
          </>
        ) : (
          <>
            <div className="field">
              <label>Request body</label>
              <textarea name="requestBody" value={(scenarios[activeIndex] && scenarios[activeIndex].requestBody) || ''} onChange={(e) => handleChange(e, activeIndex)} />
            </div>
            <div className="field">
              <label>Response body</label>
              <textarea name="responseBody" value={(scenarios[activeIndex] && scenarios[activeIndex].responseBody) || ''} onChange={(e) => handleChange(e, activeIndex)} />
            </div>
          </>
        )}

        <div className="field">
          <label>Observation comments</label>
          <textarea name="observations" value={scenarios[activeIndex].observations} onChange={(e) => handleChange(e, activeIndex)} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => exportPDF()}>Export evidence (PDF)</button>
        </div>
      </form>
    </div>
  )
}