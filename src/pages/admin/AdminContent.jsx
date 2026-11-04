import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { api } from '../../lib/api.js'
import { useAppData } from '../../lib/appData.jsx'
import { useI18n } from '../../lib/i18n.jsx'
import { useToast } from '../../lib/toast.jsx'
import usePageMeta from '../../lib/useMeta.js'

function useSettings() {
  const [data, setData] = useState(null)
  const [saving, setSaving] = useState(false)
  const { reload } = useAppData()
  const { t } = useI18n()
  const toast = useToast()

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => setData(res.data || {}))
      .catch(() => setData({}))
  }, [])

  const update = (path, value) => {
    setData((prev) => {
      if (!prev) return prev
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let cursor = next
      for (let i = 0; i < parts.length - 1; i += 1) {
        const key = parts[i]
        if (cursor[key] === undefined || cursor[key] === null) {
          cursor[key] = /^\d+$/.test(parts[i + 1]) ? [] : {}
        }
        cursor = cursor[key]
      }
      cursor[parts[parts.length - 1]] = value
      return next
    })
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', { data })
      await reload()
      toast.success(t('admin.settingsSaved'))
    } catch (err) {
      toast.error(err.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  return { data, update, save, saving }
}

export function AdminHomepage() {
  const { t, pick } = useI18n()
  const { data, update, save, saving } = useSettings()

  usePageMeta({ title: `${t('admin.homepage')} — EstatePro` })

  if (!data) return <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />

  const sections = data.sections || {}
  const stats = data.stats || []

  return (
    <>
      <form
        className="card panel"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <h2 className="h-card" style={{ marginBlockEnd: 18 }}>{pick('Hero section', 'بخش هیرو')}</h2>
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="h-eyebrow">{pick('Eyebrow (EN)', 'متن بالای عنوان (انگلیسی)')}</label>
            <input id="h-eyebrow" className="input" value={data.heroEyebrow || ''} onChange={(e) => update('heroEyebrow', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-eyebrow-fa">{pick('Eyebrow (FA)', 'متن بالای عنوان (فارسی)')}</label>
            <input id="h-eyebrow-fa" className="input" dir="rtl" value={data.heroEyebrowFa || ''} onChange={(e) => update('heroEyebrowFa', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-accent">{pick('Highlighted words (EN)', 'کلمات برجسته (انگلیسی)')}</label>
            <input id="h-accent" className="input" value={data.heroHeadingAccent || ''} onChange={(e) => update('heroHeadingAccent', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-accent-fa">{pick('Highlighted words (FA)', 'کلمات برجسته (فارسی)')}</label>
            <input id="h-accent-fa" className="input" dir="rtl" value={data.heroHeadingAccentFa || ''} onChange={(e) => update('heroHeadingAccentFa', e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label" htmlFor="h-heading">{pick('Main heading (EN)', 'عنوان اصلی (انگلیسی)')}</label>
            <input id="h-heading" className="input" value={data.heroHeading || ''} onChange={(e) => update('heroHeading', e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label" htmlFor="h-heading-fa">{pick('Main heading (FA)', 'عنوان اصلی (فارسی)')}</label>
            <input id="h-heading-fa" className="input" dir="rtl" value={data.heroHeadingFa || ''} onChange={(e) => update('heroHeadingFa', e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label" htmlFor="h-desc">{pick('Description (EN)', 'توضیحات (انگلیسی)')}</label>
            <textarea id="h-desc" className="textarea" rows={3} value={data.heroDescription || ''} onChange={(e) => update('heroDescription', e.target.value)} />
          </div>
          <div className="field span-2">
            <label className="label" htmlFor="h-desc-fa">{pick('Description (FA)', 'توضیحات (فارسی)')}</label>
            <textarea id="h-desc-fa" className="textarea" dir="rtl" rows={3} value={data.heroDescriptionFa || ''} onChange={(e) => update('heroDescriptionFa', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-image">{pick('Hero image URL', 'نشانی تصویر هیرو')}</label>
            <input id="h-image" className="input" value={data.heroImage || ''} onChange={(e) => update('heroImage', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="w-image">{pick('Why-us image URL', 'نشانی تصویر بخش چرا ما')}</label>
            <input id="w-image" className="input" value={data.whyImage || ''} onChange={(e) => update('whyImage', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-aside-title">{pick('Aside card title', 'عنوان کارت کنار هیرو')}</label>
            <input id="h-aside-title" className="input" value={data.heroAsideTitle || ''} onChange={(e) => update('heroAsideTitle', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="h-aside-text">{pick('Aside card text', 'متن کارت کنار هیرو')}</label>
            <input id="h-aside-text" className="input" value={data.heroAsideText || ''} onChange={(e) => update('heroAsideText', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="w-heading">{pick('Why-us heading (EN)', 'عنوان بخش چرا ما (انگلیسی)')}</label>
            <input id="w-heading" className="input" value={data.whyHeading || ''} onChange={(e) => update('whyHeading', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="w-heading-fa">{pick('Why-us heading (FA)', 'عنوان بخش چرا ما (فارسی)')}</label>
            <input id="w-heading-fa" className="input" dir="rtl" value={data.whyHeadingFa || ''} onChange={(e) => update('whyHeadingFa', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="f-heading">{pick('Featured heading (EN)', 'عنوان املاک ویژه (انگلیسی)')}</label>
            <input id="f-heading" className="input" value={sections.featuredHeading || ''} onChange={(e) => update('sections.featuredHeading', e.target.value)} />
          </div>
          <div className="field">
            <label className="label" htmlFor="f-heading-fa">{pick('Featured heading (FA)', 'عنوان املاک ویژه (فارسی)')}</label>
            <input id="f-heading-fa" className="input" dir="rtl" value={sections.featuredHeadingFa || ''} onChange={(e) => update('sections.featuredHeadingFa', e.target.value)} />
          </div>
        </div>

        <h2 className="h-card" style={{ marginBlock: '26px 16px' }}>{pick('Statistics', 'آمار')}</h2>
        <div className="stack gap-12">
          {stats.map((stat, index) => (
            <div className="row gap-10 wrap" key={stat.key || index}>
              <input
                className="input"
                style={{ maxWidth: 120 }}
                type="number"
                step="any"
                value={stat.value}
                onChange={(e) => update(`stats.${index}.value`, Number(e.target.value))}
                aria-label={`${stat.key} value`}
              />
              <input
                className="input"
                style={{ maxWidth: 90 }}
                value={stat.suffix || ''}
                onChange={(e) => update(`stats.${index}.suffix`, e.target.value)}
                aria-label={`${stat.key} suffix`}
              />
              <input
                className="input"
                style={{ maxWidth: 90 }}
                dir="rtl"
                value={stat.suffixFa || ''}
                onChange={(e) => update(`stats.${index}.suffixFa`, e.target.value)}
                aria-label={`${stat.key} suffix fa`}
              />
              <input
                className="input grow"
                value={stat.labelEn || ''}
                onChange={(e) => update(`stats.${index}.labelEn`, e.target.value)}
                aria-label={`${stat.key} label en`}
              />
              <input
                className="input grow"
                dir="rtl"
                value={stat.labelFa || ''}
                onChange={(e) => update(`stats.${index}.labelFa`, e.target.value)}
                aria-label={`${stat.key} label fa`}
              />
            </div>
          ))}
        </div>

        <h2 className="h-card" style={{ marginBlock: '26px 16px' }}>{pick('Homepage sections', 'بخش‌های صفحه اصلی')}</h2>
        <div className="row wrap gap-16">
          {['categories', 'whyUs', 'featured', 'luxury', 'developments', 'locations', 'howItWorks', 'latest', 'testimonials', 'faq', 'newsletter', 'cta'].map((key) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                checked={sections[key] !== false}
                onChange={(e) => update(`sections.${key}`, e.target.checked)}
              />
              {key}
            </label>
          ))}
        </div>

        <button type="submit" className="btn btn-gold" style={{ marginBlockStart: 24 }} disabled={saving}>
          <Save size={15} /> {saving ? t('common.saving') : t('admin.saveSettings')}
        </button>
      </form>
    </>
  )
}

export function AdminSettings() {
  const { t, pick } = useI18n()
  const { data, update, save, saving } = useSettings()

  usePageMeta({ title: `${t('admin.settings')} — EstatePro` })

  if (!data) return <div className="skeleton" style={{ height: 320, borderRadius: 20 }} />

  return (
    <form
      className="card panel"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <h2 className="h-card" style={{ marginBlockEnd: 18 }}>{pick('Website', 'وب‌سایت')}</h2>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="s-name">{pick('Website name', 'نام وب‌سایت')}</label>
          <input id="s-name" className="input" value={data.siteName || ''} onChange={(e) => update('siteName', e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="s-tagline">{pick('Tagline', 'شعار')}</label>
          <input id="s-tagline" className="input" value={data.tagline || ''} onChange={(e) => update('tagline', e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="s-currency">{pick('Default currency', 'واحد پول پیش‌فرض')}</label>
          <select id="s-currency" className="select" value={data.defaultCurrency || 'AED'} onChange={(e) => update('defaultCurrency', e.target.value)}>
            {['AED', 'USD', 'PKR', 'EUR'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="s-lang">{pick('Default language', 'زبان پیش‌فرض')}</label>
          <select id="s-lang" className="select" value={data.defaultLanguage || 'en'} onChange={(e) => update('defaultLanguage', e.target.value)}>
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </div>
      </div>

      <h2 className="h-card" style={{ marginBlock: '26px 16px' }}>{pick('Contact information', 'اطلاعات تماس')}</h2>
      <div className="form-grid">
        <div className="field">
          <label className="label" htmlFor="s-phone">{t('common.phone')}</label>
          <input id="s-phone" className="input" value={data.contact?.phone || ''} onChange={(e) => update('contact.phone', e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="s-email">{t('common.email')}</label>
          <input id="s-email" className="input" value={data.contact?.email || ''} onChange={(e) => update('contact.email', e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="s-whatsapp">{pick('WhatsApp number', 'شماره واتساپ')}</label>
          <input id="s-whatsapp" className="input" value={data.contact?.whatsapp || ''} onChange={(e) => update('contact.whatsapp', e.target.value)} />
        </div>
        <div className="field">
          <label className="label" htmlFor="s-hours">{pick('Opening hours (EN)', 'ساعات کاری (انگلیسی)')}</label>
          <input id="s-hours" className="input" value={data.contact?.hours_en || ''} onChange={(e) => update('contact.hours_en', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="s-addr">{pick('Address (EN)', 'نشانی (انگلیسی)')}</label>
          <input id="s-addr" className="input" value={data.contact?.address_en || ''} onChange={(e) => update('contact.address_en', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="s-addr-fa">{pick('Address (FA)', 'نشانی (فارسی)')}</label>
          <input id="s-addr-fa" className="input" dir="rtl" value={data.contact?.address_fa || ''} onChange={(e) => update('contact.address_fa', e.target.value)} />
        </div>
      </div>

      <h2 className="h-card" style={{ marginBlock: '26px 16px' }}>{pick('Social media', 'شبکه‌های اجتماعی')}</h2>
      <div className="form-grid">
        {['instagram', 'linkedin', 'facebook', 'x'].map((network) => (
          <div className="field" key={network}>
            <label className="label" htmlFor={`s-${network}`}>{network}</label>
            <input
              id={`s-${network}`}
              className="input"
              value={data.social?.[network] || ''}
              onChange={(e) => update(`social.${network}`, e.target.value)}
            />
          </div>
        ))}
      </div>

      <h2 className="h-card" style={{ marginBlock: '26px 16px' }}>{pick('SEO', 'سئو')}</h2>
      <div className="form-grid">
        <div className="field span-2">
          <label className="label" htmlFor="s-seo-title">{pick('Meta title', 'عنوان متا')}</label>
          <input id="s-seo-title" className="input" value={data.seo?.title || ''} onChange={(e) => update('seo.title', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="s-seo-desc">{pick('Meta description', 'توضیحات متا')}</label>
          <textarea id="s-seo-desc" className="textarea" rows={3} value={data.seo?.description || ''} onChange={(e) => update('seo.description', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="label" htmlFor="s-seo-keywords">{pick('Keywords', 'کلمات کلیدی')}</label>
          <input id="s-seo-keywords" className="input" value={data.seo?.keywords || ''} onChange={(e) => update('seo.keywords', e.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn btn-gold" style={{ marginBlockStart: 24 }} disabled={saving}>
        <Save size={15} /> {saving ? t('common.saving') : t('admin.saveSettings')}
      </button>
    </form>
  )
}
