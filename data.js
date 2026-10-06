/* =====================================================================
   GULF PRODUCT PAGE 2.0 – DATA LAYER (data.js)
   ---------------------------------------------------------------------
   PROTOTYPE / DEMONSTRATION DATA. Product names, codes, specifications,
   approvals, technical values, compatibility and distributors below are
   illustrative. They are not Gulf technical data and make no claims.

   PRODUCTION: this file is replaced by the CMS / product information
   system. One record per product, same shape, drives the whole page:
   content, internal links, FAQs, JSON-LD, metadata and lead context.
   ===================================================================== */
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------- Shared entities (each would be its own indexable page) ---------- */
const APPLICATIONS = [
  {id:'passenger-cars', name:'Passenger Cars', desc:'Engine lubrication for hatchbacks, sedans and SUVs in daily city and highway use.'},
  {id:'petrol-engines', name:'Petrol Engines', desc:'Naturally aspirated and turbocharged petrol engines.'},
  {id:'diesel-engines', name:'Diesel Engines', desc:'Passenger and commercial diesel engines, including those with after-treatment systems.'},
  {id:'modern-engine-systems', name:'Modern Engine Systems', desc:'Engines with turbocharging, direct injection and stop-start systems.'},
  {id:'fleet', name:'Fleet', desc:'Vehicles run commercially, where uptime and service planning matter.'},
  {id:'motorcycles', name:'Motorcycles', desc:'Four-stroke motorcycles with a shared engine, gearbox and wet clutch.'},
  {id:'city-commuting', name:'City Commuting', desc:'Short trips and stop-go traffic.'},
  {id:'trucks-and-buses', name:'Trucks & Buses', desc:'Heavy-duty diesel engines in goods and passenger transport.'},
  {id:'construction-equipment', name:'Construction Equipment', desc:'Excavators, loaders and other off-highway machines.'},
  {id:'mobile-hydraulics', name:'Mobile Hydraulics', desc:'Hydraulic systems on machines that work outdoors across a wide temperature range.'},
  {id:'industrial-hydraulics', name:'Industrial Hydraulics', desc:'Presses, power packs and plant hydraulic systems.'},
  {id:'tractors', name:'Tractors', desc:'Farm tractors and related equipment.'},
  {id:'tractor-transmissions', name:'Tractor Transmissions & Wet Brakes', desc:'Common-sump systems where one fluid serves transmission, hydraulics and wet brakes.'}
];
const INDUSTRIES = [
  {id:'automotive', name:'Automotive', desc:'Private vehicles and the workshops that service them.'},
  {id:'mobility', name:'Mobility', desc:'Shared and personal mobility, including two-wheelers.'},
  {id:'fleet', name:'Fleet', desc:'Commercial vehicle operators.'},
  {id:'construction', name:'Construction', desc:'Earthmoving, road building and site equipment.'},
  {id:'manufacturing', name:'Manufacturing', desc:'Plant and process equipment.'},
  {id:'agriculture', name:'Agriculture', desc:'Farm mechanisation.'}
];

/* General lubrication knowledge, not product claims */
const ARTICLES = [
  {id:'understanding-engine-oil-viscosity', category:'Lubrication Basics', mins:4, title:'Understanding Engine Oil Viscosity', summary:'What grades such as 5W-30 and 15W-40 tell you.', body:['Viscosity is an oil\'s resistance to flow. In a grade such as 5W-30, the first number with "W" describes how the oil flows when cold, and the second describes its viscosity at engine operating temperature.','A lower first number means easier cold starts. The second number should match what the engine manufacturer specifies. The owner\'s manual is the reference.']},
  {id:'what-does-api-certification-mean', category:'Specifications', mins:3, title:'What Does API Certification Mean?', summary:'How API service categories describe engine oil performance.', body:['The American Petroleum Institute (API) defines service categories for engine oils. Categories starting with "S" cover petrol engines and those starting with "C" cover diesel engines.','Each newer category was introduced for a newer generation of engines. Check the category your manufacturer asks for before choosing an oil.']},
  {id:'what-are-acea-sequences', category:'Specifications', mins:3, title:'What Are ACEA Sequences?', summary:'The European performance sequences for engine oils.', body:['ACEA, the European vehicle manufacturers\' association, publishes oil sequences. Letters group them by engine type, for example light-duty engines with after-treatment systems or heavy-duty diesel engines.','Many vehicle manufacturers reference an ACEA sequence alongside their own specification.']},
  {id:'how-to-choose-the-right-engine-oil', category:'Engine Oils', mins:5, title:'How to Choose the Right Engine Oil', summary:'Start with the manual, then consider how the vehicle is used.', body:['Three things decide the choice: the viscosity grade, the performance specification and any manufacturer approval the vehicle requires. All three are listed in the owner\'s manual.','After that, consider use. Short trips, heavy loads, dust and high temperature all make oil work harder.']},
  {id:'understanding-oil-change-intervals', category:'Maintenance', mins:4, title:'Understanding Oil Change Intervals', summary:'Why intervals differ and who sets them.', body:['The vehicle or equipment manufacturer sets the oil change interval, based on the engine, the oil specification and the type of use.','Severe use, such as short trips, dust or heavy load, usually calls for a shorter interval. Follow the manufacturer\'s schedule.']},
  {id:'how-to-read-a-technical-data-sheet', category:'Technical Documents', mins:3, title:'How to Read a Technical Data Sheet', summary:'What the typical properties on a TDS mean.', body:['A Technical Data Sheet lists the product\'s description, applications, specifications and typical physical properties such as viscosity, viscosity index, flash point and pour point.','Typical values describe normal production and are not a guarantee for each batch. The Safety Data Sheet covers handling, storage and disposal.']},
  {id:'hydraulic-fluid-basics', category:'Hydraulic Fluids', mins:4, title:'Hydraulic Fluid Basics', summary:'ISO viscosity grades and fluid types.', body:['Hydraulic fluids are graded by ISO VG number, which is the viscosity at 40 °C. ISO VG 46 is thinner than ISO VG 68.','Anti-wear fluids suit systems at steady temperature. High-viscosity-index fluids change less between cold start and hot running, which helps equipment working outdoors.']},
  {id:'jaso-for-motorcycle-oils', category:'Specifications', mins:3, title:'JASO Standards for Motorcycle Oils', summary:'Why motorcycles with wet clutches need their own standard.', body:['Many motorcycles use one oil for the engine, gearbox and wet clutch. The JASO T 903 standard classifies oils by clutch friction performance.','Motorcycles with a wet clutch are typically specified with an MA category, while many automatic scooters are specified with MB. Check the manual.']},
  {id:'what-is-utto', category:'Agriculture', mins:3, title:'What Is a UTTO?', summary:'One fluid for tractor transmission, hydraulics and wet brakes.', body:['A Universal Tractor Transmission Oil serves the transmission, final drives, hydraulic system and oil-immersed brakes from one sump.','Because each tractor maker defines its own requirement, the fluid must match the specification in the tractor manual.']}
];

/* What each specification type means. Opens from band 6 and links to an article. */
const SPEC_TYPES = {
  'OEM specification': {meaning:'A requirement written by the vehicle or equipment manufacturer. Meeting it, or holding a formal approval against it, shows the product suits that manufacturer\'s equipment.', article:'how-to-choose-the-right-engine-oil'},
  'API': {meaning:'An engine oil service category from the American Petroleum Institute. "S" categories cover petrol engines and "C" categories diesel engines; newer categories serve newer engines.', article:'what-does-api-certification-mean'},
  'ACEA': {meaning:'A European oil sequence published by the vehicle manufacturers\' association, grouped by engine type.', article:'what-are-acea-sequences'},
  'SAE': {meaning:'The viscosity grade. The number before "W" describes cold flow and the number after describes viscosity at operating temperature.', article:'understanding-engine-oil-viscosity'},
  'JASO': {meaning:'A Japanese standard that classifies motorcycle oils by wet-clutch friction performance.', article:'jaso-for-motorcycle-oils'},
  'ISO VG': {meaning:'The ISO viscosity grade of an industrial oil: its viscosity at 40 °C.', article:'hydraulic-fluid-basics'},
  'DIN': {meaning:'A German standard. For hydraulic fluids it defines performance classes for anti-wear and high-viscosity-index fluids.', article:'hydraulic-fluid-basics'}
};

/* ---------- Products: ONE shape, rendered by ONE template ---------- */
const demoApprovals = org => [
  {name:'Demo OEM Approval A', org:`Demo ${org} manufacturer`, applicability:'Illustrative: selected demo models', source:'Approval letter placeholder (not a real document)', status:'Prototype data'},
  {name:'Demo OEM Approval B', org:`Demo ${org} manufacturer`, applicability:'Illustrative: demo engine family', source:'Approval list placeholder (not a real document)', status:'Prototype data'},
  {name:'Demo Industry Licence', org:'Demo standards body', applicability:'Illustrative: product category licence', source:'Licence register placeholder', status:'Prototype data'}
];
const models = (...oems) => oems.map(oem => ({oem, models:['Demo model A','Demo model B','Demo model C']}));

const PRODUCTS = [
  {
    id:'gulf-demo-ultra-5w-30', name:'Gulf Demo Ultra 5W-30', sku:'DEMO-PCMO-0530', status:'Active (demo)',
    category:'Passenger Car Motor Oil', categoryPath:['Automotive','Passenger Cars','Engine Oils','Fully Synthetic'],
    tagline:'Advanced lubricant technology designed for modern passenger vehicle applications.',
    description:'A demonstration fully synthetic engine oil record for petrol and diesel passenger cars.',
    grade:'5W-30', keySpec:'Demo: API SP', color:'#12407f',
    applications:['passenger-cars','petrol-engines','diesel-engines','modern-engine-systems'],
    industries:['automotive','mobility','fleet'],
    vehicles: models('Tata','Mahindra','Hyundai','Kia','Maruti Suzuki','Toyota'), equipment:[],
    specifications:[{type:'OEM specification',value:'Demo OEM spec 001'},{type:'API',value:'Demo: SP'},{type:'ACEA',value:'Demo: C3'},{type:'SAE',value:'5W-30'}],
    approvals: demoApprovals('vehicle'),
    technicalData:[['SAE Grade','5W-30'],['Density @ 15°C','0.85 g/ml'],['Viscosity @ 40°C','68 cSt'],['Viscosity @ 100°C','11.8 cSt'],['Viscosity Index','170'],['Flash Point','228 °C'],['Pour Point','-39 °C']],
    benefits:[{title:'Wear Protection',text:'Designed to maintain a protective film between moving parts.'},{title:'Thermal Stability',text:'Formulated to resist breakdown at engine operating temperature.'},{title:'Engine Cleanliness',text:'Detergent additives help keep deposits in suspension.'},{title:'Cold-Start Flow',text:'A low winter grade supports oil flow at start-up.'},{title:'After-Treatment Compatibility',text:'Illustrative: intended for engines with emission after-treatment.'}],
    documents:[{type:'TDS',title:'Technical Data Sheet',version:'Demo v1.0'},{type:'SDS',title:'Safety Data Sheet',version:'Demo v1.0'}],
    relatedProducts:['gulf-demo-fleet-15w-40','gulf-demo-rider-4t-10w-30','gulf-demo-hydro-46'],
    relatedApplications:['passenger-cars','fleet','petrol-engines','diesel-engines'],
    technicalArticles:['understanding-engine-oil-viscosity','what-does-api-certification-mean','how-to-choose-the-right-engine-oil','understanding-oil-change-intervals']
  },
  {
    id:'gulf-demo-rider-4t-10w-30', name:'Gulf Demo Rider 4T 10W-30', sku:'DEMO-MCO-1030', status:'Active (demo)',
    category:'Motorcycle Oil', categoryPath:['Automotive','Two-Wheelers','Engine Oils','4-Stroke'],
    tagline:'Engine oil designed for four-stroke commuter motorcycles.',
    description:'A demonstration four-stroke motorcycle engine oil record for bikes with a wet clutch.',
    grade:'10W-30', keySpec:'Demo: JASO MA2', color:'#b3261e',
    applications:['motorcycles','city-commuting','petrol-engines'], industries:['automotive','mobility'],
    vehicles: models('Hero','Honda','Bajaj','TVS','Royal Enfield'), equipment:[],
    specifications:[{type:'OEM specification',value:'Demo OEM spec 014'},{type:'API',value:'Demo: SN'},{type:'JASO',value:'Demo: MA2'},{type:'SAE',value:'10W-30'}],
    approvals: demoApprovals('two-wheeler'),
    technicalData:[['SAE Grade','10W-30'],['Density @ 15°C','0.87 g/ml'],['Viscosity @ 40°C','72 cSt'],['Viscosity @ 100°C','11.0 cSt'],['Viscosity Index','142'],['Flash Point','226 °C'],['Pour Point','-30 °C']],
    benefits:[{title:'Clutch Performance',text:'Friction characteristics intended for wet-clutch operation.'},{title:'Wear Protection',text:'Designed to protect the engine and gearbox sharing one oil.'},{title:'Stop-Go Riding',text:'Formulated for frequent starts in city traffic.'},{title:'Engine Cleanliness',text:'Detergent additives help control deposits.'}],
    documents:[{type:'TDS',title:'Technical Data Sheet',version:'Demo v1.0'},{type:'SDS',title:'Safety Data Sheet',version:'Demo v1.0'}],
    relatedProducts:['gulf-demo-ultra-5w-30','gulf-demo-fleet-15w-40'],
    relatedApplications:['motorcycles','city-commuting'],
    technicalArticles:['jaso-for-motorcycle-oils','understanding-engine-oil-viscosity','understanding-oil-change-intervals','how-to-read-a-technical-data-sheet']
  },
  {
    id:'gulf-demo-fleet-15w-40', name:'Gulf Demo Fleet 15W-40', sku:'DEMO-CVO-1540', status:'Active (demo)',
    category:'Commercial Vehicle Oil', categoryPath:['Automotive','Commercial Vehicles','Engine Oils','Heavy-Duty Diesel'],
    tagline:'Heavy-duty diesel engine oil designed for trucks, buses and off-highway equipment.',
    description:'A demonstration heavy-duty diesel engine oil record for fleets and construction equipment.',
    grade:'15W-40', keySpec:'Demo: API CK-4', color:'#0b2a5b',
    applications:['trucks-and-buses','diesel-engines','fleet','construction-equipment'], industries:['fleet','construction'],
    vehicles: models('Tata','Ashok Leyland','BharatBenz','Eicher'), equipment: models('JCB','CAT','Komatsu'),
    specifications:[{type:'OEM specification',value:'Demo OEM spec 027'},{type:'API',value:'Demo: CK-4'},{type:'ACEA',value:'Demo: E9'},{type:'SAE',value:'15W-40'}],
    approvals: demoApprovals('engine'),
    technicalData:[['SAE Grade','15W-40'],['Density @ 15°C','0.88 g/ml'],['Viscosity @ 40°C','112 cSt'],['Viscosity @ 100°C','15.0 cSt'],['Viscosity Index','140'],['Flash Point','232 °C'],['Pour Point','-33 °C']],
    benefits:[{title:'Soot Handling',text:'Dispersants intended to keep soot in suspension.'},{title:'Wear Protection',text:'Designed for loaded diesel engines.'},{title:'Thermal Stability',text:'Formulated to resist oxidation under sustained load.'},{title:'After-Treatment Compatibility',text:'Illustrative: intended for engines with emission after-treatment.'}],
    documents:[{type:'TDS',title:'Technical Data Sheet',version:'Demo v1.0'},{type:'SDS',title:'Safety Data Sheet',version:'Demo v1.0'}],
    relatedProducts:['gulf-demo-hydro-46','gulf-demo-ultra-5w-30','gulf-demo-tractor-utto'],
    relatedApplications:['trucks-and-buses','fleet','construction-equipment','diesel-engines'],
    technicalArticles:['what-does-api-certification-mean','what-are-acea-sequences','understanding-oil-change-intervals','understanding-engine-oil-viscosity']
  },
  {
    id:'gulf-demo-hydro-46', name:'Gulf Demo Hydro HVI 46', sku:'DEMO-HYD-0046', status:'Active (demo)',
    category:'Hydraulic Fluid', categoryPath:['Industrial','Hydraulics','Hydraulic Fluids','High Viscosity Index'],
    tagline:'Hydraulic fluid designed for mobile and industrial hydraulic systems.',
    description:'A demonstration high-viscosity-index hydraulic fluid record for mobile and plant hydraulics.',
    grade:'ISO VG 46', keySpec:'Demo: DIN 51524-3', color:'#1e6b45',
    applications:['mobile-hydraulics','industrial-hydraulics','construction-equipment'], industries:['construction','manufacturing'],
    vehicles:[], equipment: models('JCB','CAT','Komatsu','Tata Hitachi'),
    specifications:[{type:'OEM specification',value:'Demo OEM spec 041'},{type:'ISO VG',value:'46'},{type:'DIN',value:'Demo: 51524-3 HVLP'}],
    approvals: demoApprovals('equipment'),
    technicalData:[['ISO Viscosity Grade','46'],['Density @ 15°C','0.87 g/ml'],['Viscosity @ 40°C','46 cSt'],['Viscosity @ 100°C','8.1 cSt'],['Viscosity Index','150'],['Flash Point','220 °C'],['Pour Point','-36 °C']],
    benefits:[{title:'Viscosity Control',text:'A high viscosity index limits change between cold start and hot running.'},{title:'Pump Protection',text:'Anti-wear additives intended for hydraulic pumps.'},{title:'Corrosion Protection',text:'Designed to protect system metals.'},{title:'Filterability',text:'Formulated for fine filtration systems.'}],
    documents:[{type:'TDS',title:'Technical Data Sheet',version:'Demo v1.0'},{type:'SDS',title:'Safety Data Sheet',version:'Demo v1.0'}],
    relatedProducts:['gulf-demo-fleet-15w-40','gulf-demo-tractor-utto'],
    relatedApplications:['mobile-hydraulics','industrial-hydraulics','construction-equipment'],
    technicalArticles:['hydraulic-fluid-basics','how-to-read-a-technical-data-sheet','understanding-oil-change-intervals']
  },
  {
    id:'gulf-demo-tractor-utto', name:'Gulf Demo Tractor UTTO', sku:'DEMO-AGR-UTTO', status:'Active (demo)',
    category:'Agricultural Lubricant', categoryPath:['Agriculture','Tractors','Transmission Fluids','UTTO'],
    tagline:'One fluid designed for tractor transmissions, hydraulics and wet brakes.',
    description:'A demonstration universal tractor transmission oil record.',
    grade:'10W-30', keySpec:'Demo: API GL-4', color:'#2f7d32',
    applications:['tractors','tractor-transmissions'], industries:['agriculture'],
    vehicles:[], equipment: models('Mahindra','Swaraj','John Deere','Sonalika'),
    specifications:[{type:'OEM specification',value:'Demo OEM spec 058'},{type:'API',value:'Demo: GL-4'},{type:'SAE',value:'10W-30'}],
    approvals: demoApprovals('tractor'),
    technicalData:[['SAE Grade','10W-30'],['Density @ 15°C','0.88 g/ml'],['Viscosity @ 40°C','60 cSt'],['Viscosity @ 100°C','9.6 cSt'],['Viscosity Index','145'],['Flash Point','222 °C'],['Pour Point','-36 °C']],
    benefits:[{title:'One Fluid',text:'Serves transmission, hydraulics and wet brakes from one sump.'},{title:'Brake Performance',text:'Friction characteristics intended for oil-immersed brakes.'},{title:'Gear Protection',text:'Designed to protect transmission gears.'},{title:'Hydraulic Response',text:'Formulated for implement hydraulics.'}],
    documents:[{type:'TDS',title:'Technical Data Sheet',version:'Demo v1.0'},{type:'SDS',title:'Safety Data Sheet',version:'Demo v1.0'}],
    relatedProducts:['gulf-demo-fleet-15w-40','gulf-demo-hydro-46'],
    relatedApplications:['tractors','tractor-transmissions'],
    technicalArticles:['what-is-utto','understanding-oil-change-intervals','how-to-read-a-technical-data-sheet']
  }
];

/* Derived fields: URL, OEM list and FAQs are GENERATED from the record.
   This is the scalability point: a new product gets its URL, internal
   links, FAQs and structured data without anyone writing them by hand. */
const appName = id => (APPLICATIONS.find(a => a.id === id) || {}).name;
PRODUCTS.forEach(p => {
  p.categorySlug = slug(p.category);
  p.url = `/products/${p.categorySlug}/${p.id}`;
  p.oems = [...new Set([...p.vehicles, ...p.equipment].map(v => v.oem))];
});
PRODUCTS.forEach(p => {
  const apps = p.applications.map(appName).join(', '), specs = p.specifications.map(s => `${s.type} ${s.value}`).join('; ');
  const fits = p.oems.join(', '), kind = p.vehicles.length ? (p.equipment.length ? 'vehicles and equipment' : 'vehicles') : 'equipment';
  const other = PRODUCTS.find(x => x.id === p.relatedProducts[0]);
  p.faqs = [
    {q:`What is ${p.name} used for?`, a:`${p.name} is a ${p.category.toLowerCase()} in the Gulf range. It is designed for these applications: ${apps}.`},
    {q:`Which ${kind} can use ${p.name}?`, a:`This page lists illustrative compatibility for ${p.name} with ${kind} from ${fits}. Always confirm against the manufacturer's manual or with a Gulf technical expert.`},
    {q:`What viscosity grade is ${p.name}?`, a:`${p.name} is grade ${p.grade}.`},
    {q:`What specifications does ${p.name} meet?`, a:`The prototype record for ${p.name} lists: ${specs}. These are demo specifications; the current Gulf Technical Data Sheet is the validated source.`},
    {q:`How is ${p.name} different from other Gulf products?`, a:`${p.name} is a ${p.category.toLowerCase()} in grade ${p.grade}. ${other.name}, for comparison, is a ${other.category.toLowerCase()} in grade ${other.grade}. Use the comparison tool on this page to see them side by side.`},
    {q:`Can ${p.name} be used in high-temperature conditions?`, a:`Suitability for high-temperature operation depends on the grade and specification the manufacturer requires. Check the technical data on this page for ${p.name} and ask a Gulf technical expert about your operating conditions.`},
    {q:`Where can I buy ${p.name}?`, a:`${p.name} is available through Gulf authorized distributors. Enter your pincode in the distributor finder on this page to see the nearest one.`},
    {q:`How can I get technical advice on ${p.name}?`, a:`Use the "Talk to a Gulf Expert" form on this page. Your request is sent with ${p.name} as the product of interest.`}
  ];
});

/* Product Finder entry points (closed discovery loop back to a product page) */
const FINDER_TYPES = [
  {label:'Passenger car', icon:'🚗', product:'gulf-demo-ultra-5w-30'},
  {label:'Motorcycle', icon:'🏍️', product:'gulf-demo-rider-4t-10w-30'},
  {label:'Truck or bus', icon:'🚛', product:'gulf-demo-fleet-15w-40'},
  {label:'Hydraulic system', icon:'🔧', product:'gulf-demo-hydro-46'},
  {label:'Tractor', icon:'🚜', product:'gulf-demo-tractor-utto'}
];

/* Demo distributors. PRODUCTION: distributor locator API. */
const DISTRIBUTORS = [
  {name:'Gulf Authorized Distributor', area:'Andheri East', city:'Mumbai', pin:'400093', range:'Automotive Products'},
  {name:'Gulf Authorized Distributor', area:'Vashi', city:'Navi Mumbai', pin:'400703', range:'Automotive + Industrial Products'},
  {name:'Gulf Authorized Distributor', area:'Okhla', city:'Delhi', pin:'110020', range:'Automotive Products'},
  {name:'Gulf Authorized Distributor', area:'Peenya', city:'Bengaluru', pin:'560058', range:'Industrial Products'},
  {name:'Gulf Authorized Distributor', area:'Ambattur', city:'Chennai', pin:'600058', range:'Automotive + Industrial Products'},
  {name:'Gulf Authorized Distributor', area:'Chakan', city:'Pune', pin:'410501', range:'Commercial Vehicle Products'},
  {name:'Gulf Authorized Distributor', area:'Naroda', city:'Ahmedabad', pin:'382330', range:'Automotive + Agriculture Products'}
];
