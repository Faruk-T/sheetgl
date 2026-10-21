import React, { useMemo } from 'react';
import { ColumnDef } from '../../datagrid/types/grid';
import { Deferred } from '../../datagrid/core/ValidationEngine';
import { DocThemeColors } from '../types';
import { LiveDemoBox } from '../components/LiveDemoBox';
import { Callout } from '../components/Callout';
import { CodeBlock } from '../components/CodeBlock';
import { SimpleTable } from '../components/SimpleTable';

export interface ValidationSectionProps {
  isDark: boolean;
  isTR: boolean;
  colors: DocThemeColors;
}

const VALIDATION_DEMO_DATA = [
  { id: 1, code: 'ACC-100001', email: 'finance@acme.io', balance: 45000 },
  { id: 2, code: 'ACC-100002', email: 'ops@nexus.io', balance: 128500 },
  { id: 3, code: 'ACC-100003', email: 'legal@vertex.io', balance: 92000 },
];

export const ValidationSection: React.FC<ValidationSectionProps> = ({
  isDark,
  isTR,
  colors,
}) => {
  const validationPlaygroundCols = useMemo<ColumnDef[]>(
    () => [
      { id: 'id', title: 'ID', type: 'number', decimalDigits: 0, width: 65, readonly: true },
      {
        id: 'code',
        title: isTR ? 'Hesap Kodu (Deferred Async)' : 'Account Code (Deferred Async)',
        type: 'text',
        width: 210,
        validationRules: [
          {
            type: 'required',
            message: isTR ? 'Hesap kodu zorunludur!' : 'Account code is required!',
          },
          {
            type: 'pattern',
            pattern: /^ACC-\d{6}$/,
            message: isTR
              ? 'Format "ACC-100001" şeklinde olmalıdır!'
              : 'Must match "ACC-100001" format!',
          },
          {
            type: 'async',
            message: isTR
              ? 'Backend Deferred Reddi: ACC-000000 ve ACC-999999 rezerve edilmiştir (false döndü)!'
              : 'Backend Deferred Rejected: ACC-000000 and ACC-999999 are reserved (returned false)!',
            validationCallback: ({ value, deferred }) => {
              setTimeout(() => {
                const isAllowed = value !== 'ACC-000000' && value !== 'ACC-999999';
                deferred.resolve(isAllowed);
              }, 240);
              return deferred.promise();
            },
          },
        ],
      },
      {
        id: 'email',
        title: isTR ? 'E-Posta (Deferred Async)' : 'Email (Deferred Async)',
        type: 'email',
        width: 215,
        validationRules: [
          { type: 'required' },
          { type: 'email' },
          {
            type: 'async',
            message: isTR
              ? 'Bu e-posta (taken@acme.io) sunucuda zaten kayıtlı (false)!'
              : 'This email (taken@acme.io) is already registered on the server (false)!',
            validationCallback: ({ value }) => {
              const d = new Deferred<boolean>();
              setTimeout(() => {
                const isUnique = String(value).trim().toLowerCase() !== 'taken@acme.io';
                d.resolve(isUnique);
              }, 220);
              return d.promise();
            },
          },
        ],
      },
      {
        id: 'balance',
        title: isTR ? 'Bakiye ($0 - $1M Range)' : 'Balance ($0 - $1M Range)',
        type: 'currency',
        width: 190,
        currencySymbol: '$',
        decimalDigits: 2,
        validationRules: [
          { type: 'required' },
          {
            type: 'range',
            min: 0,
            max: 1000000,
            message: isTR
              ? 'Bakiye $0 ile $1,000,000 arasında olmalıdır (Negatif girilemez)!'
              : 'Balance must be between $0 and $1,000,000 (Cannot be negative)!',
          },
        ],
      },
    ],
    [isTR]
  );

  return (
    <div>
      <div id="val-live">
        <LiveDemoBox
          title={
            isTR
              ? 'Canlı Doğrulama (Static & Backend Deferred Async) Test Tablosu'
              : 'Live Validation Playground (Static & DevExtreme Deferred Async)'
          }
          subtitle={
            isTR
              ? 'Aşağıdaki hücrelerde kural dışı bir değer girip Enter tuşuna basın: giriş engellenecek ve hücre altında kırmızı ⛔ hata mesajı açılacaktır.'
              : 'Try entering an invalid value below and press Enter: the entry will be strictly blocked and an inline red ⛔ error banner will appear.'
          }
          hints={
            isTR
              ? [
                  'Hesap Kodu hücresine "ACC-000000" yazıp Enter’a basın → Backend Deferred false döner ve girişi engeller!',
                  'E-Posta hücresine "taken@acme.io" yazın → new Deferred() false döner ve girişi engeller!',
                  'Bakiye hücresine "-500" yazın → Statik range kuralı negatif girişi engeller!',
                ]
              : [
                  'Type "ACC-000000" in Account Code and press Enter → Backend Deferred resolves false and blocks entry!',
                  'Type "taken@acme.io" in Email and press Enter → new Deferred() resolves false and blocks entry!',
                  'Type "-500" in Balance and press Enter → Static range rule blocks negative numbers!',
                ]
          }
          height={240}
          isDark={isDark}
          isTR={isTR}
          colors={colors}
          data={VALIDATION_DEMO_DATA}
          columns={validationPlaygroundCols}
        />
      </div>

      <Callout
        type="tip"
        isDark={isDark}
        colors={colors}
        title={
          isTR
            ? 'DevExtreme Tarzı Deferred (true / false) Asenkron Doğrulama'
            : 'DevExtreme-Style Deferred (true / false) Async Validation'
        }
      >
        {isTR ? (
          <>
            SheetGL Pro, DevExtreme DataGrid’deki <code>Deferred</code> yapısını birebir destekler.{' '}
            <code>type: 'async'</code> kuralında <code>validationCallback</code> içerisine hazır bir{' '}
            <code>deferred</code> nesnesi gelir (veya <code>new Deferred()</code> /{' '}
            <code>createDeferred()</code> oluşturabilirsiniz):
            <br />• <code>deferred.resolve(true)</code> çağrıldığında değer{' '}
            <strong>kabul edilir ve hücreye yazılır</strong>.
            <br />• <code>deferred.resolve(false)</code> çağrıldığında giriş{' '}
            <strong>kesin olarak engellenir</strong> ve kuralın <code>message</code> metni gösterilir.
            <br />• <code>deferred.reject("Sunucu özel hata mesajı")</code> çağrıldığında ise sunucudan
            gelen dinamik hata mesajı gösterilerek giriş engellenir.
          </>
        ) : (
          <>
            SheetGL Pro natively supports the DevExtreme DataGrid <code>Deferred</code> pattern. Inside an{' '}
            <code>async</code> rule’s <code>validationCallback</code>, you can use the built-in{' '}
            <code>deferred</code> parameter (or instantiate <code>new Deferred()</code> /{' '}
            <code>createDeferred()</code>):
            <br />• Calling <code>deferred.resolve(true)</code> <strong>accepts and commits</strong> the
            cell value.
            <br />• Calling <code>deferred.resolve(false)</code> <strong>strictly blocks the entry</strong>{' '}
            and displays <code>rule.message</code>.
            <br />• Calling <code>deferred.reject("Custom backend message")</code> blocks the entry with a
            custom server message.
          </>
        )}
      </Callout>

      <h3 id="val-deferred" style={{ fontSize: 20, fontWeight: 800, margin: '24px 0 8px' }}>
        {isTR
          ? 'DevExtreme Deferred Yapısı ile Asenkron Backend Doğrulama (true / false)'
          : 'DevExtreme Deferred Pattern for Async Backend Validation (true / false)'}
      </h3>
      <CodeBlock
        id="val-deferred-code"
        title="DevExtreme Deferred Async Validation (resolve true / false)"
        langBadge="TSX"
        isDark={isDark}
        isTR={isTR}
        colors={colors}
        code={`import { SheetGL, ColumnDef, Deferred, createDeferred } from 'sheetgl';

const columns: ColumnDef[] = [
  {
    id: 'code',
    title: '${isTR ? 'Hesap Kodu' : 'Account Code'}',
    type: 'text',
    width: 160,
    validationRules: [
      { type: 'required', message: '${isTR ? 'Hesap kodu zorunludur!' : 'Account code is required!'}' },
      { type: 'pattern', pattern: /^ACC-\\d{6}$/, message: 'Format ACC-100001!' },
      {
        type: 'async',
        message: '${isTR ? 'Bu hesap kodu sunucuda zaten kayıtlı!' : 'This account code is already registered!'}',
        validationCallback: ({ value, data, deferred }) => {
          fetch(\`/api/accounts/check-code?code=\${encodeURIComponent(value)}&id=\${data.id}\`)
            .then((res) => res.json())
            .then((response: { isValid: boolean }) => {
              deferred.resolve(response.isValid); // true -> Valid, false -> Blocked!
            })
            .catch(() => {
              deferred.reject('Validation service unreachable!');
            });

          return deferred.promise();
        },
      },
    ],
  },
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    width: 200,
    validationRules: [
      { type: 'required' },
      { type: 'email' },
      {
        type: 'async',
        message: 'Email is already taken!',
        validationCallback: (params) => {
          const d = createDeferred<boolean>();
          setTimeout(() => {
            d.resolve(params.value !== 'taken@acme.io'); // true or false
          }, 250);
          return d.promise();
        },
      },
    ],
  },
];`}
      />

      <h3 id="val-table" style={{ fontSize: 20, fontWeight: 800, margin: '28px 0 8px' }}>
        {isTR
          ? 'Tüm Doğrulama Kuralı Türleri (Static & Async)'
          : 'Complete Reference of All 9 Validation Rule Types'}
      </h3>
      <SimpleTable
        colors={colors}
        headers={
          isTR
            ? ['Kural Tipi (type)', 'Yapı', 'Dönüş / Parametre', 'Açıklama']
            : ['Rule Type (type)', 'Mode', 'Return / Options', 'Description']
        }
        rows={
          isTR
            ? [
                ['required', 'Static', 'trim?: boolean, message?: string', 'Hücrenin boş bırakılmasını engeller'],
                ['range', 'Static', 'min?: number, max?: number', 'Sayısal değerin alt ve üst sınırlar içinde olmasını zorunlu kılar'],
                ['stringLength', 'Static', 'min?: number, max?: number', 'Metin karakter uzunluğunu denetler'],
                ['pattern', 'Static', 'pattern: RegExp | string', 'Değerin RegExp formatına uymasını zorunlu kılar'],
                ['email / url', 'Static', 'ignoreEmptyValue?: boolean', 'E-posta veya URL formatını doğrular'],
                ['compare', 'Static', 'comparisonTarget: (row) => any', 'Aynı satırdaki başka bir sütunla karşılaştırma yapar (==, !=, >, >=, <, <=)'],
                ['custom', 'Static Callback', 'validationCallback => boolean', 'Senkron true / false döndüren özel doğrulama fonksiyonu'],
                ['async', 'Deferred / Promise', 'deferred.resolve(true | false) veya Promise<boolean>', 'Asenkron Backend API doğrulaması; false dönerse hücre girişi engellenir'],
              ]
            : [
                ['required', 'Static', 'trim?: boolean, message?: string', 'Prevents empty cell values'],
                ['range', 'Static', 'min?: number, max?: number', 'Enforces numeric min and max bounds'],
                ['stringLength', 'Static', 'min?: number, max?: number', 'Enforces character length bounds'],
                ['pattern', 'Static', 'pattern: RegExp | string', 'Requires value to match a RegExp pattern'],
                ['email / url', 'Static', 'ignoreEmptyValue?: boolean', 'Validates email or http/https URL format'],
                ['compare', 'Static', 'comparisonTarget: (row) => any', 'Compares value against another field in the same row (==, !=, >, >=, <, <=)'],
                ['custom', 'Static Callback', 'validationCallback => boolean', 'Synchronous callback returning true or false'],
                ['async', 'Deferred / Promise', 'deferred.resolve(true | false) or Promise<boolean>', 'Async backend validation; resolving false strictly blocks cell entry'],
              ]
        }
      />
    </div>
  );
};
