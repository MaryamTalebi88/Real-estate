import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n.jsx'
import { useAppData } from '../lib/appData.jsx'
import usePageMeta from '../lib/useMeta.js'

export function Privacy() {
  const { t, pick } = useI18n()
  const { settings } = useAppData()
  usePageMeta({ title: `${t('footer.privacy')} — EstatePro` })

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 60px)' }}>
      <div className="container">
        <div className="prose">
          <span className="eyebrow">{settings.siteName || 'EstatePro'}</span>
          <h1 className="h-section" style={{ marginBlock: '16px 20px' }}>{t('footer.privacy')}</h1>
          <p>
            {pick(
              'This policy explains what we collect when you use EstatePro, why we collect it, and the choices you have.',
              'این سیاست توضیح می‌دهد هنگام استفاده از استیت‌پرو چه اطلاعاتی جمع‌آوری می‌کنیم، چرا و چه انتخاب‌هایی دارید.',
            )}
          </p>

          <h2>{pick('What we collect', 'چه اطلاعاتی جمع می‌کنیم')}</h2>
          <ul>
            <li>{pick('Account details: name, email, phone number and a hashed password.', 'اطلاعات حساب: نام، ایمیل، تلفن و رمز عبور هش‌شده.')}</li>
            <li>{pick('Activity: properties you view, save or list, and enquiries you send.', 'فعالیت: املاکی که می‌بینید، ذخیره می‌کنید یا ثبت می‌کنید و درخواست‌هایی که می‌فرستید.')}</li>
            <li>{pick('Listing content you upload, including photographs and descriptions.', 'محتوای آگهی که بارگذاری می‌کنید، شامل تصاویر و توضیحات.')}</li>
          </ul>

          <h2>{pick('How we use it', 'چگونه استفاده می‌کنیم')}</h2>
          <p>
            {pick(
              'To show your enquiries to the relevant advisor, to review listings before publication, and to improve search results. We do not sell personal data.',
              'برای نمایش درخواست‌های شما به مشاور مربوطه، بررسی آگهی‌ها پیش از انتشار و بهبود نتایج جستجو. ما داده‌های شخصی را نمی‌فروشیم.',
            )}
          </p>

          <h2>{pick('Your choices', 'انتخاب‌های شما')}</h2>
          <p>
            {pick(
              'You can edit or delete your profile data at any time from your account settings, or ask us to remove your account by contacting support.',
              'می‌توانید هر زمان اطلاعات پروفایل خود را از تنظیمات حساب ویرایش یا حذف کنید، یا با تماس با پشتیبانی درخواست حذف حساب دهید.',
            )}
          </p>

          <p style={{ marginBlockStart: 30 }}>
            <Link to="/contact" className="btn btn-outline btn-sm">{t('nav.contact')}</Link>
          </p>
        </div>
      </div>
    </section>
  )
}

export function Terms() {
  const { t, pick } = useI18n()
  const { settings } = useAppData()
  usePageMeta({ title: `${t('footer.terms')} — EstatePro` })

  return (
    <section className="section" style={{ paddingTop: 'calc(var(--header-h) + 60px)' }}>
      <div className="container">
        <div className="prose">
          <span className="eyebrow">{settings.siteName || 'EstatePro'}</span>
          <h1 className="h-section" style={{ marginBlock: '16px 20px' }}>{t('footer.terms')}</h1>
          <p>
            {pick(
              'These terms govern the use of the EstatePro marketplace by buyers, renters, owners and agents.',
              'این شرایط استفاده از بازار استیت‌پرو توسط خریداران، مستأجران، مالکان و مشاوران را تنظیم می‌کند.',
            )}
          </p>

          <h2>{pick('Listings', 'آگهی‌ها')}</h2>
          <p>
            {pick(
              'Owners and agents are responsible for the accuracy of submitted listings. EstatePro reviews every submission, may request documents, and may decline or remove listings that cannot be verified.',
              'مالکان و مشاوران مسئول صحت آگهی‌های ثبت‌شده هستند. استیت‌پرو هر آگهی را بررسی می‌کند، می‌تواند مدارک درخواست کند و آگهی‌هایی را که قابل تأیید نباشد رد یا حذف کند.',
            )}
          </p>

          <h2>{pick('Fees', 'کارمزد')}</h2>
          <p>
            {pick(
              'Listing a property is free. Commission on a completed sale or tenancy is agreed in writing with the advisor before viewings begin.',
              'ثبت ملک رایگان است. کارمزد فروش یا اجاره تکمیل‌شده پیش از شروع بازدید به‌صورت کتبی با مشاور توافق می‌شود.',
            )}
          </p>

          <h2>{pick('Acceptable use', 'استفاده مجاز')}</h2>
          <ul>
            <li>{pick('Do not submit properties you do not own or represent.', 'ملکی را که مالک یا نماینده آن نیستید ثبت نکنید.')}</li>
            <li>{pick('Do not scrape, resell or misuse other users’ contact details.', 'اطلاعات تماس کاربران دیگر را استخراج، بازفروش یا بداستفاده نکنید.')}</li>
            <li>{pick('Accounts that breach these rules may be suspended.', 'حساب‌هایی که این قوانین را نقض کنند ممکن است تعلیق شوند.')}</li>
          </ul>

          <p style={{ marginBlockStart: 30 }}>
            <Link to="/contact" className="btn btn-outline btn-sm">{t('nav.contact')}</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
