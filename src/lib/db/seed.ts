import { prisma } from './prisma'

export async function seedDatabase() {
  const empCount = await prisma.employee.count()
  if (empCount > 0) return

  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeId: 'EMP001',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@company.com',
        department: 'Engineering',
        designation: 'Senior Developer',
        salary: 95000,
        leaveBalance: 18,
        phone: '+91-9876543210',
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP002',
        name: 'Priya Patel',
        email: 'priya.patel@company.com',
        department: 'Marketing',
        designation: 'Marketing Manager',
        salary: 85000,
        leaveBalance: 12,
        phone: '+91-9876543211',
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP003',
        name: 'Amit Kumar',
        email: 'amit.kumar@company.com',
        department: 'Finance',
        designation: 'Financial Analyst',
        salary: 75000,
        leaveBalance: 22,
        phone: '+91-9876543212',
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP004',
        name: 'Sneha Singh',
        email: 'sneha.singh@company.com',
        department: 'HR',
        designation: 'HR Coordinator',
        salary: 65000,
        leaveBalance: 8,
        phone: '+91-9876543213',
      },
    }),
    prisma.employee.create({
      data: {
        employeeId: 'EMP005',
        name: 'Vikram Joshi',
        email: 'vikram.joshi@company.com',
        department: 'Engineering',
        designation: 'Backend Developer',
        salary: 88000,
        leaveBalance: 15,
        phone: '+91-9876543214',
      },
    }),
  ])

  const products = await Promise.all([
    prisma.product.create({
      data: {
        productId: 'PROD001',
        name: 'Laptop Pro 15',
        category: 'Electronics',
        price: 129999,
        cost: 95000,
        description: 'High-performance laptop for professionals',
      },
    }),
    prisma.product.create({
      data: {
        productId: 'PROD002',
        name: 'Wireless Mouse',
        category: 'Accessories',
        price: 2499,
        cost: 1200,
        description: 'Ergonomic wireless mouse',
      },
    }),
    prisma.product.create({
      data: {
        productId: 'PROD003',
        name: 'Mechanical Keyboard',
        category: 'Accessories',
        price: 5999,
        cost: 3000,
        description: 'RGB mechanical keyboard',
      },
    }),
    prisma.product.create({
      data: {
        productId: 'PROD004',
        name: '27-inch Monitor',
        category: 'Electronics',
        price: 34999,
        cost: 22000,
        description: '4K UHD Monitor for designers',
      },
    }),
    prisma.product.create({
      data: {
        productId: 'PROD005',
        name: 'USB-C Hub',
        category: 'Accessories',
        price: 3999,
        cost: 1800,
        description: '7-in-1 USB-C hub adapter',
      },
    }),
  ])

  await Promise.all([
    prisma.inventory.create({
      data: { productId: products[0].id, quantity: 45, location: 'Warehouse A', minStock: 10 },
    }),
    prisma.inventory.create({
      data: { productId: products[1].id, quantity: 200, location: 'Warehouse B', minStock: 50 },
    }),
    prisma.inventory.create({
      data: { productId: products[2].id, quantity: 150, location: 'Warehouse A', minStock: 30 },
    }),
    prisma.inventory.create({
      data: { productId: products[3].id, quantity: 30, location: 'Warehouse C', minStock: 5 },
    }),
    prisma.inventory.create({
      data: { productId: products[4].id, quantity: 300, location: 'Warehouse B', minStock: 100 },
    }),
  ])

  await Promise.all([
    prisma.policy.create({
      data: {
        title: 'Leave Policy',
        category: 'HR',
        content: `Leave Policy Guidelines:
1. Annual Leave: Employees get 24 annual leave days per year.
2. Sick Leave: 12 sick leave days per year with medical certificate required for 3+ consecutive days.
3. Casual Leave: 6 casual leave days per year.
4. Carry Forward: Maximum 15 unused leave days can be carried forward to next year.
5. Approval: Leave requests must be approved by the reporting manager at least 2 days in advance for planned leave.
6. Emergency Leave: Can be applied on the same day with proper justification.
7. Leave Balance: Minimum balance of 2 leave days must be maintained at all times.`,
        description: 'Company leave policy and guidelines',
      },
    }),
    prisma.policy.create({
      data: {
        title: 'Inventory Management Policy',
        category: 'Operations',
        content: `Inventory Management Policy:
1. Minimum stock levels must be maintained for all products.
2. Reorder point is when stock falls below minimum threshold.
3. Monthly inventory audit is mandatory.
4. Damaged items must be reported within 24 hours.
5. Stock transfers between warehouses require manager approval.
6. Inventory adjustments must be documented and approved.`,
        description: 'Inventory management guidelines',
      },
    }),
    prisma.policy.create({
      data: {
        title: 'Employee Code of Conduct',
        category: 'HR',
        content: `Code of Conduct:
1. All employees must maintain professional behavior.
2. Conflicts of interest must be disclosed.
3. Confidential information must not be shared externally.
4. Harassment of any form is strictly prohibited.
5. Company resources must be used responsibly.
6. Compliance with all applicable laws and regulations is mandatory.`,
        description: 'Employee code of conduct policy',
      },
    }),
    prisma.policy.create({
      data: {
        title: 'Purchase Approval Policy',
        category: 'Finance',
        content: `Purchase Approval Policy:
1. Purchases under ₹50,000 can be approved by department head.
2. Purchases between ₹50,000 - ₹5,00,000 require VP approval.
3. Purchases above ₹5,00,000 require CEO approval.
4. All purchases must have at least 2 vendor quotes.
5. Emergency purchases can be approved post-facto with justification.`,
        description: 'Purchase approval hierarchy and limits',
      },
    }),
  ])

  await Promise.all([
    prisma.fAQ.create({
      data: {
        question: 'How do I apply for leave?',
        answer: 'You can apply for leave by submitting a leave request through the HR portal. Your request will be forwarded to your reporting manager for approval. Please ensure you apply at least 2 days in advance for planned leave.',
        category: 'HR',
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is the company work timing?',
        answer: 'Standard work hours are 9:30 AM to 6:30 PM, Monday through Friday. Flexible timing options are available with manager approval.',
        category: 'General',
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'How do I reset my password?',
        answer: 'You can reset your password by clicking on "Forgot Password" on the login page. An OTP will be sent to your registered email address.',
        category: 'IT',
      },
    }),
    prisma.fAQ.create({
      data: {
        question: 'What is the reimbursement policy?',
        answer: 'Travel and expense reimbursements are processed within 15 business days of submission. All expenses must be supported by valid receipts and approved by your reporting manager.',
        category: 'Finance',
      },
    }),
  ])

  await Promise.all([
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[0].id,
        startDate: new Date('2026-07-10'),
        endDate: new Date('2026-07-12'),
        reason: 'Personal vacation',
        status: 'PENDING',
        days: 3,
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[1].id,
        startDate: new Date('2026-07-15'),
        endDate: new Date('2026-07-16'),
        reason: 'Medical appointment',
        status: 'PENDING',
        days: 2,
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[3].id,
        startDate: new Date('2026-07-05'),
        endDate: new Date('2026-07-05'),
        reason: 'Personal work',
        status: 'PENDING',
        days: 1,
      },
    }),
  ])

  await Promise.all([
    prisma.knowledgeDocument.create({
      data: {
        title: 'Company Overview',
        content: 'TechCorp Solutions is a leading technology company specializing in enterprise software solutions. Founded in 2015, we have grown to serve over 500 clients worldwide with a team of 200+ employees across offices in Bangalore, Mumbai, and Delhi.',
        source: 'internal',
        category: 'company',
      },
    }),
    prisma.knowledgeDocument.create({
      data: {
        title: 'IT Support Guidelines',
        content: 'For IT support: Contact the IT helpdesk at ext. 1001 or email it-support@company.com. Response time SLA: Critical issues within 1 hour, High priority within 4 hours, Medium within 8 hours, Low within 24 hours.',
        source: 'internal',
        category: 'IT',
      },
    }),
    prisma.knowledgeDocument.create({
      data: {
        title: 'Employee Benefits Summary',
        content: 'Benefits include: Health insurance coverage up to ₹5,00,000, Annual performance bonus up to 20% of salary, 24 annual leave days, 12 sick leave days, Learning & development budget of ₹50,000 per year, Stock options for eligible employees.',
        source: 'internal',
        category: 'HR',
      },
    }),
  ])

  console.log('Database seeded successfully!')
}
