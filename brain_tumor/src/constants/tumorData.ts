import type { SampleCase, TumorDetails } from '../types';

export const TUMOR_INFO: Record<string, TumorDetails> = {
  notumor: {
    name: 'No Tumor Detected',
    category: 'Normal / Healthy Scan',
    severity: 'Safe',
    description: 'The scan displays normal symmetrical cerebral hemisphere parenchyma with preserved gray-white differentiation and no space-occupying lesions or midline shift.',
    characteristics: [
      'Normal ventricular volume and morphology',
      'No abnormal mass effect or hyperintense focus',
      'Intact sulcal-gyral pattern',
      'Preserved midline structures'
    ],
    clinicalSteps: [
      'Standard baseline radiological record documentation',
      'Routine clinical follow-up if symptoms persist',
      'No neurosurgical intervention indicated'
    ],
    badgeColor: '#10b981'
  },
  glioma: {
    name: 'Glioma',
    category: 'Intra-axial Glial Neoplasm',
    severity: 'High',
    description: 'Gliomas arise from supportive glial tissue of the brain. They are characterized by infiltrative growth patterns, peripheral edema, and heterogeneous signal intensity.',
    characteristics: [
      'Heterogeneous T1/T2 signal intensity with surrounding vasogenic edema',
      'Irregular peripheral ring enhancement on contrast sequences',
      'Mass effect with potential compression of adjacent sulci or ventricles',
      'Commonly localized in cerebral hemispheres (frontal/temporal lobes)'
    ],
    clinicalSteps: [
      'Urgent neurosurgical and neuro-oncology referral',
      'Multi-parametric MRI with Spectroscopy & Perfusion (DSC-MRI)',
      'Stereotactic biopsy or surgical maximal safe resection planning',
      'Molecular profiling (IDH mutation, 1p/19q codeletion, MGMT promoter)'
    ],
    badgeColor: '#f43f5e'
  },
  meningioma: {
    name: 'Meningioma',
    category: 'Extra-axial Dural Tumor',
    severity: 'Moderate',
    description: 'Meningiomas arise from the arachnoid cap cells of the meninges. Most are benign, slow-growing, and well-circumscribed extra-axial lesions with prominent contrast enhancement.',
    characteristics: [
      'Extra-axial mass with broad-based dural attachment',
      'Classic "dural tail" sign visible on post-contrast T1 scans',
      'Homogeneous and vivid contrast enhancement',
      'Frequent displacement of adjacent cortical brain parenchyma'
    ],
    clinicalSteps: [
      'Neurosurgical consultation for surgical accessibility assessment',
      'Serial volumetric MRI surveillance for slow-growing asymptomatic lesions',
      'Consideration of stereotactic radiosurgery (Gamma Knife / CyberKnife)',
      'Preoperative embolization evaluation for large hypervascular lesions'
    ],
    badgeColor: '#f59e0b'
  },
  pituitary: {
    name: 'Pituitary Adenoma',
    category: 'Sellar / Parasellar Tumor',
    severity: 'Moderate',
    description: 'Tumors originating from the pituitary gland within the sella turcica. They can cause hormonal dysregulation and mass effect on the optic chiasm causing visual field defects.',
    characteristics: [
      'Expansion or remodeling of the sella turcica floor',
      'Suprasellar extension with potential compression of optic chiasm',
      'Variable enhancement; microadenomas may appear as focal hypo-enhancing areas',
      'Potential cavernous sinus extension'
    ],
    clinicalSteps: [
      'Comprehensive endocrine hormone panel evaluation (Prolactin, GH, ACTH, TSH)',
      'Formal Humphrey visual field automated perimetry testing',
      'Endocrinology and skull base neurosurgery co-consultation',
      'Endoscopic endonasal transsphenoidal surgery or medical therapy (e.g. Cabergoline)'
    ],
    badgeColor: '#8b5cf6'
  }
};

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'sample-normal',
    title: 'Normal Brain MRI',
    label: 'notumor',
    displayName: 'Healthy Symmetrical Scan',
    description: 'Axial T2 MRI showing clear ventricular symmetry and no focal lesions.',
    imageSrc: '/samples/sample_normal.jpg',
    typicalConfidence: 0.994
  },
  {
    id: 'sample-glioma',
    title: 'Frontal Lobe Glioma',
    label: 'glioma',
    displayName: 'Anterior High-Grade Glioma',
    description: 'Contrast T1 MRI showing hyperintense infiltrative ring lesion in the frontal cortex.',
    imageSrc: '/samples/sample_tumor_glioma.jpg',
    typicalConfidence: 0.988
  },
  {
    id: 'sample-meningioma',
    title: 'Parasagittal Meningioma',
    label: 'meningioma',
    displayName: 'Circumscribed Dural Meningioma',
    description: 'Axial scan demonstrating broad-based extra-axial dural attachment lesion.',
    imageSrc: '/samples/sample_meningioma.jpg',
    typicalConfidence: 0.976
  },
  {
    id: 'sample-pituitary',
    title: 'Pituitary Macroadenoma',
    label: 'pituitary',
    displayName: 'Sellar Region Macroadenoma',
    description: 'Coronal T1 MRI displaying suprasellar tumor with optic chiasm proximity.',
    imageSrc: '/samples/sample_pituitary.jpg',
    typicalConfidence: 0.982
  }
];
