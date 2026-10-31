# 🗄️ Database Schema

> All collections are stored in MongoDB. Timestamps (`createdAt`, `updatedAt`) are auto-managed by Mongoose.

---

## Users

```
users
├── _id             ObjectId  (PK)
├── name            String    required
├── email           String    required, unique
├── passwordHash    String    required
├── role            Enum      ['admin', 'staff', 'customer']
├── status          Enum      ['active', 'inactive', 'suspended']
├── phone           String
├── avatar          String    (URL)
├── refreshToken    String
├── createdAt       Date
└── updatedAt       Date
```

---

## Products

```
products
├── _id             ObjectId
├── name            String    required
├── description     String
├── category        String
├── isActive        Boolean   default: true
├── variants        [ProductVariant embedded]
│   ├── _id         ObjectId
│   ├── name        String
│   ├── price       Number
│   ├── billingCycle Enum    ['monthly','quarterly','yearly','one-time']
│   └── features    [String]
├── createdBy       ObjectId  ref: users
├── createdAt       Date
└── updatedAt       Date
```

---

## Subscription Plans

```
plans
├── _id             ObjectId
├── name            String    required
├── product         ObjectId  ref: products
├── variant         ObjectId  (embedded variant id)
├── price           Number
├── billingCycle    Enum
├── trialDays       Number    default: 0
├── isActive        Boolean
├── createdAt       Date
└── updatedAt       Date
```

---

## Customers

```
customers
├── _id             ObjectId
├── user            ObjectId  ref: users (1:1)
├── companyName     String
├── billingAddress  Object
│   ├── line1       String
│   ├── city        String
│   ├── state       String
│   ├── country     String
│   └── postalCode  String
├── taxId           String
├── createdAt       Date
└── updatedAt       Date
```

---

## Subscriptions

```
subscriptions
├── _id             ObjectId
├── customer        ObjectId  ref: customers
├── plan            ObjectId  ref: plans
├── status          Enum      ['active','paused','cancelled','expired','trial']
├── startDate       Date
├── endDate         Date
├── nextBillingDate Date
├── trialEndDate    Date
├── discount        ObjectId  ref: discounts (nullable)
├── quantity        Number    default: 1
├── autoRenew       Boolean   default: true
├── cancelledAt     Date
├── createdBy       ObjectId  ref: users
├── createdAt       Date
└── updatedAt       Date
```

---

## Quotations

```
quotations
├── _id             ObjectId
├── quotationNumber String    unique (e.g. QT-2024-0001)
├── customer        ObjectId  ref: customers
├── status          Enum      ['draft','sent','accepted','rejected','expired']
├── validUntil      Date
├── items           [QuotationItem]
│   ├── plan        ObjectId  ref: plans
│   ├── quantity    Number
│   ├── unitPrice   Number
│   └── discount    Number
├── tax             ObjectId  ref: taxes
├── subtotal        Number
├── taxAmount       Number
├── total           Number
├── notes           String
├── createdBy       ObjectId  ref: users
├── createdAt       Date
└── updatedAt       Date
```

---

## Invoices

```
invoices
├── _id             ObjectId
├── invoiceNumber   String    unique (e.g. INV-2024-0001)
├── subscription    ObjectId  ref: subscriptions
├── customer        ObjectId  ref: customers
├── status          Enum      ['draft','sent','paid','overdue','cancelled']
├── dueDate         Date
├── paidAt          Date
├── items           [InvoiceItem]
│   ├── description String
│   ├── quantity    Number
│   ├── unitPrice   Number
│   └── amount      Number
├── subtotal        Number
├── taxAmount       Number
├── discountAmount  Number
├── total           Number
├── isRecurring     Boolean   default: false
├── generatedAt     Date
├── createdAt       Date
└── updatedAt       Date
```

---

## Payments

```
payments
├── _id             ObjectId
├── invoice         ObjectId  ref: invoices
├── customer        ObjectId  ref: customers
├── amount          Number
├── status          Enum      ['pending','completed','failed','refunded']
├── method          Enum      ['card','bank_transfer','upi','cash','wallet']
├── transactionId   String
├── paidAt          Date
├── createdAt       Date
└── updatedAt       Date
```

---

## Taxes

```
taxes
├── _id             ObjectId
├── name            String    (e.g. "GST 18%")
├── rate            Number    (percentage, e.g. 18)
├── isActive        Boolean
├── createdAt       Date
└── updatedAt       Date
```

---

## Discounts

```
discounts
├── _id             ObjectId
├── code            String    unique
├── type            Enum      ['percentage','fixed']
├── value           Number
├── maxUses         Number
├── usedCount       Number    default: 0
├── validFrom       Date
├── validUntil      Date
├── applicablePlans [ObjectId] ref: plans
├── isActive        Boolean
├── createdAt       Date
└── updatedAt       Date
```

---

## Audit Logs

```
audit_logs
├── _id             ObjectId
├── actor           ObjectId  ref: users
├── action          String    (e.g. 'subscription.cancelled')
├── entity          String    (collection name)
├── entityId        ObjectId
├── changes         Object    (before/after diff)
├── ip              String
├── createdAt       Date
```
