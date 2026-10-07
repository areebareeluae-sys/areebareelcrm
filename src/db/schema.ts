import { sqliteTable, text, integer, real ,numeric} from 'drizzle-orm/sqlite-core';
// Users Table
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name : text('name').notNull(),
  email : text('email').notNull(),
  password : text('password').notNull(),
  phone : text('phone').notNull(),
  country : text('country').notNull(),
  image: text("image"), // Profile picture ka Cloudinary URL (by default null/empty)
  bio: text("bio"),     // Maximum 500 words/characters ki bio
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'), 
});
export const customer = sqliteTable('customer',{
  refname : text('refname').notNull(),
  refnumber : text('refnumber').notNull(),
  refemail : text('refemail').notNull(),
  refaddress : text('refaddress').notNull(),
  id: text('id').primaryKey(),
  fullname : text('fullname').notNull(),
  email : text('email').notNull(),
  phone : text('phone').notNull(),
  country : text('country').notNull(),
  city : text('city').notNull(),
  address : text('address').notNull(),
  tags: text('tags').notNull(),
  createdby : text('createdby').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'), 
});
export const leadcustomer = sqliteTable('leadcustomer',{
  refname : text('refname').notNull(),
  refnumber : text('refnumber').notNull(),
  refemail : text('refemail').notNull(),
  refaddress : text('refaddress').notNull(),
  id: text('id').primaryKey(),
  fullname : text('fullname').notNull(),
  email : text('email').notNull(),
  phone : text('phone').notNull(),
  country : text('country').notNull(),
  city : text('city').notNull(),
  address : text('address').notNull(),
  tags: text('tags').notNull(),
  createdby : text('createdby').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'), 
});
export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => leadcustomer.id),
  remarks: text('remarks').notNull(),
  nextFollowupDate: text('next_followup_date').notNull(), // Format: YYYY-MM-DD
  status: text('status').notNull().default('Pending'), // Pending, Completed, Cancelled
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
export const property = sqliteTable('property', {
  refname : text('refname').notNull(),
  refnumber : text('refnumber').notNull(),
  refemail : text('refemail').notNull(),
  refaddress : text('refaddress').notNull(),
  id: text('id').primaryKey(),
  title : text('title').notNull(),
  category : text('category').notNull(),
  description : text('description').notNull(),
  maxprice : numeric('price').notNull(),
  minprice : numeric('minprice').notNull(),
  address : text('address').notNull(),
  city : text('city').notNull(),
  country : text('country').notNull(),
  type : text('type').notNull(),
  bathrooms : integer('bathrooms').notNull(),
  bedrooms : integer('bedrooms').notNull(),
  area : numeric('area').notNull(),
  Garages : integer('garages').notNull(),
  images : text('images').notNull(),
  Purchaseorderid : text('Purchaseorderid').default(''),
  tags: text('tags').notNull(),
  salescustomerid : text('salescustomerid').notNull(),
  buyercustomerid : text('buyercustomerid').notNull(),
  advance : numeric('advance').notNull(),
  fullpaymentdate : text('fullpaymentdate').notNull(),
  createdby : text('createdby').notNull(),
  closedby : text('closedby').notNull(),
  closedprice : numeric('closedprice').notNull(),
  closeddate : text('closeddate').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'), 
});
export const crminvoice = sqliteTable('crminvoice', {
  id: text('id').primaryKey(),
  propertyid : text('propertyid').notNull(),
  companycommission : integer('companycommission').notNull(),
  govttax : text('govttax').notNull(),
  discount : text('discount').notNull(),
  totalammount : text('totalammount').notNull(),
  createdby : text('createdby').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'), 
});
export const activity_logs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  propertyid : text('propertyid').notNull(),
  property_id : integer('property_id').notNull(),
  action : text('action').notNull(),
  details : text('details').notNull(),
  performed_by : text('performed_by').notNull(),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
 
});
export const securityGuards = sqliteTable('security_guards', {
  id: text('id').primaryKey(),
  buildingNo: integer('building_no').notNull(),
  buildingName: text('building_name').notNull(),
  securityGuard: text('security_guard').notNull(),
  contactNumber: text('contact_number').notNull(),
  description: text('description'), // 👈 Naya column add kiya gaya hai
  constructionStatus: text('construction_status').notNull(),
  tags: text('tags').default(''), // Tags column for editing & categorization
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});
export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  tableName: text('table_name').notNull(), // Yeh batayega ke file kis ki hai: 'customer', 'property', ya 'security_guards'
  entityId: text('entity_id').notNull(),     // Uss specific record ki ID (Jaise customer.id ya property.id)
  fileUrl: text('file_url').notNull(),       // Cloudinary ka secure PDF/File URL
  title: text('title'),                      // Document ka title ya naam (Jaise: "Agreement", "Blueprint")
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  status: text('status').notNull().default('Active'),
});



