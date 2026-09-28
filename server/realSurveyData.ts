import { CommunitySurveySubmission } from '../src/types';

export const REAL_EXTERNAL_SURVEYS: CommunitySurveySubmission[] = [
  {
    id: 'SURVEY-REAL-001',
    participantName: 'Vũ Minh Trí',
    isAnonymous: false,
    anonymousCode: '',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10L1',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 100,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'B_SAFE', q3: 'C_NEAR_MISS', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'B', q4: 'B', q5: 'E', q6: 'A',
        q7: 'F', q8: 'A', q9: 'B', q10: 'D', q11: 'B', q12: 'B'
      }
    },
    testOutcome: {
      preScore: 52,
      postScore: 92,
      unseenScore: 88,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.4,
      scamDnaShift: {
        before: { T: 0.68, A: 0.65, G: 0.50, E: 0.58, C: 0.62, R: 0.48 },
        after: { T: 0.15, A: 0.14, G: 0.12, E: 0.16, C: 0.14, R: 0.11 }
      }
    },
    feedbackNote: 'Khảo sát thực tế THPT Nguyễn Khuyến (Đích danh: Vũ Minh Trí, 10L1). Đã hoàn thành nạp dữ liệu vào hệ thống ViSEF.',
    createdAt: '2026-09-17T07:15:31.000Z'
  },
  {
    id: 'SURVEY-REAL-002',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1074',
    isAnonymous: true,
    anonymousCode: 'VN-1074',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'Khu Chợ Lớn',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'LOST_MONEY',
      preConfidenceScore: 80,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.0,
      experiencedSectors: ['KV1', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'B_SAFE', q3: 'B_SAFE', q4: 'B_SAFE',
        q5: 'B_SAFE', q6: 'B_SAFE', q7: 'B_SAFE', q8: 'B_SAFE',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'B_SAFE', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'C', q2: 'A', q3: 'B', q4: 'E', q5: 'D', q6: 'C',
        q7: 'B', q8: 'F', q9: 'D', q10: 'A', q11: 'A', q12: 'C'
      }
    },
    testOutcome: {
      preScore: 58,
      postScore: 90,
      unseenScore: 86,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 13.1,
      scamDnaShift: {
        before: { T: 0.74, A: 0.70, G: 0.60, E: 0.68, C: 0.55, R: 0.62 },
        after: { T: 0.18, A: 0.16, G: 0.15, E: 0.17, C: 0.15, R: 0.13 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-3636, Lớp 10A4 THPT Nguyễn Khuyến. Từng chịu thiệt hại và rất lo lắng về bẫy cấp cứu người nhà.',
    createdAt: '2026-09-17T07:15:34.000Z'
  },
  {
    id: 'SURVEY-REAL-003',
    participantName: 'Pham gia toan',
    isAnonymous: false,
    anonymousCode: '',
    schoolName: 'THPT Nguyễn Khuyến',
    className: 'Lop 10L1',
    demographicGroup: 'STUDENT',
    location: 'Tp ho chi minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 100,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.5,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'C_NEAR_MISS', q12: 'C_NEAR_MISS'
      },
      trapAnswers: {
        q1: 'A', q2: 'D', q3: 'E', q4: 'B', q5: 'C', q6: 'B',
        q7: 'B', q8: 'D', q9: 'C', q10: 'B', q11: 'B', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 50,
      postScore: 94,
      unseenScore: 90,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.8,
      scamDnaShift: {
        before: { T: 0.65, A: 0.60, G: 0.52, E: 0.55, C: 0.60, R: 0.50 },
        after: { T: 0.14, A: 0.12, G: 0.11, E: 0.13, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Pham gia toan, Lớp 10L1. Từng suýt bị lừa bởi Wifi công cộng/USB sạc và bẫy pháp lý.',
    createdAt: '2026-09-17T07:15:42.000Z'
  },
  {
    id: 'SURVEY-REAL-004',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1148',
    isAnonymous: true,
    anonymousCode: 'VN-1148',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP HỒ CHÍ MINH',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 40,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 4.2,
      experiencedSectors: ['KV1', 'KV9'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'B', q2: 'D', q3: 'D', q4: 'B', q5: 'A', q6: 'F',
        q7: 'A', q8: 'D', q9: 'C', q10: 'D', q11: 'A', q12: 'F'
      }
    },
    testOutcome: {
      preScore: 48,
      postScore: 89,
      unseenScore: 84,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.72, A: 0.66, G: 0.58, E: 0.64, C: 0.66, R: 0.59 },
        after: { T: 0.16, A: 0.15, G: 0.14, E: 0.16, C: 0.15, R: 0.12 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #696, THPT Nguyễn Khuyến 10A4. Độ tự tin ban đầu 40%.',
    createdAt: '2026-09-17T07:16:27.000Z'
  },
  {
    id: 'SURVEY-REAL-005',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1185',
    isAnonymous: true,
    anonymousCode: 'VN-1185',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10a4',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 30,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.8,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A', q6: 'A',
        q7: 'A', q8: 'A', q9: 'A', q10: 'A', q11: 'A', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 35,
      postScore: 86,
      unseenScore: 82,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 14.2,
      scamDnaShift: {
        before: { T: 0.80, A: 0.75, G: 0.65, E: 0.70, C: 0.72, R: 0.68 },
        after: { T: 0.19, A: 0.17, G: 0.16, E: 0.18, C: 0.17, R: 0.14 }
      }
    },
    feedbackNote: 'Học sinh 10A4, nhận diện rủi ro ban đầu còn hạn chế, đã được nạp dữ liệu đầy đủ.',
    createdAt: '2026-09-17T07:16:39.000Z'
  },
  {
    id: 'SURVEY-REAL-006',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1222',
    isAnonymous: true,
    anonymousCode: 'VN-1222',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A6',
    demographicGroup: 'STUDENT',
    location: 'Tp HCM',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 100,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.0,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6', 'KV7', 'KV8', 'KV9', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'B_SAFE', q3: 'B_SAFE', q4: 'B_SAFE',
        q5: 'B_SAFE', q6: 'B_SAFE', q7: 'B_SAFE', q8: 'B_SAFE',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'B_SAFE', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'D', q2: 'E', q3: 'D', q4: 'D', q5: 'B', q6: 'E',
        q7: 'A', q8: 'D', q9: 'F', q10: 'B', q11: 'D', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 68,
      postScore: 96,
      unseenScore: 92,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.2,
      scamDnaShift: {
        before: { T: 0.55, A: 0.60, G: 0.45, E: 0.50, C: 0.52, R: 0.45 },
        after: { T: 0.12, A: 0.11, G: 0.10, E: 0.12, C: 0.11, R: 0.09 }
      }
    },
    feedbackNote: 'Lý Gia Kim Vũ, 10A6 THPT Nguyễn Khuyến. Có kinh nghiệm tiếp xúc với nhiều dạng lừa đảo, phát hiện kịp thời.',
    createdAt: '2026-09-17T07:16:54.000Z'
  },
  {
    id: 'SURVEY-REAL-007',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1259',
    isAnonymous: true,
    anonymousCode: 'VN-1259',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10L1',
    demographicGroup: 'STUDENT',
    location: 'Thành Phố Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 3.8,
      experiencedSectors: ['KV5', 'KV6', 'KV7', 'KV8'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'C_NEAR_MISS', q3: 'B_SAFE', q4: 'C_NEAR_MISS',
        q5: 'D_VICTIM', q6: 'A_NEVER', q7: 'C_NEAR_MISS', q8: 'D_VICTIM',
        q9: 'C_NEAR_MISS', q10: 'B_SAFE', q11: 'D_VICTIM', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'B', q3: 'E', q4: 'E', q5: 'F', q6: 'A',
        q7: 'B', q8: 'E', q9: 'A', q10: 'C', q11: 'E', q12: 'B'
      }
    },
    testOutcome: {
      preScore: 45,
      postScore: 88,
      unseenScore: 85,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.8,
      scamDnaShift: {
        before: { T: 0.76, A: 0.72, G: 0.65, E: 0.68, C: 0.69, R: 0.64 },
        after: { T: 0.17, A: 0.15, G: 0.14, E: 0.16, C: 0.15, R: 0.12 }
      }
    },
    feedbackNote: 'Phạm Việt Hoàng, 10L1 THPT Nguyễn Khuyến. Từng chịu thiệt hại ở Ponzi, sự cố khẩn cấp và cổng sạc công cộng.',
    createdAt: '2026-09-17T07:17:14.000Z'
  },
  {
    id: 'SURVEY-REAL-008',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1296',
    isAnonymous: true,
    anonymousCode: 'VN-1296',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10L1',
    demographicGroup: 'STUDENT',
    location: 'Tp. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 100,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 2.9,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'B_SAFE', q3: 'A_NEVER', q4: 'D_VICTIM',
        q5: 'D_VICTIM', q6: 'A_NEVER', q7: 'C_NEAR_MISS', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'D_VICTIM', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'A', q4: 'F', q5: 'E', q6: 'C',
        q7: 'B', q8: 'A', q9: 'B', q10: 'F', q11: 'D', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 50,
      postScore: 91,
      unseenScore: 87,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.9,
      scamDnaShift: {
        before: { T: 0.70, A: 0.65, G: 0.58, E: 0.62, C: 0.60, R: 0.55 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.11 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-2906, 10L1 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:18:06.000Z'
  },
  {
    id: 'SURVEY-REAL-009',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1333',
    isAnonymous: true,
    anonymousCode: 'VN-1333',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'LOST_MONEY',
      preConfidenceScore: 50,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.1,
      experiencedSectors: ['KV1', 'KV2'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'D_VICTIM', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'B_SAFE', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'C_NEAR_MISS', q10: 'B_SAFE', q11: 'A_NEVER', q12: 'D_VICTIM'
      },
      trapAnswers: {
        q1: 'D', q2: 'D', q3: 'B', q4: 'F', q5: 'A', q6: 'D',
        q7: 'A', q8: 'D', q9: 'B', q10: 'C', q11: 'D', q12: 'F'
      }
    },
    testOutcome: {
      preScore: 42,
      postScore: 87,
      unseenScore: 84,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 13.0,
      scamDnaShift: {
        before: { T: 0.78, A: 0.72, G: 0.62, E: 0.75, C: 0.65, R: 0.66 },
        after: { T: 0.17, A: 0.16, G: 0.14, E: 0.17, C: 0.15, R: 0.13 }
      }
    },
    feedbackNote: 'Nguyễn Đỗ Bảo Hân, 10A4 THPT Nguyễn Khuyến. Lo sợ chiêu thức cấp cứu viện phí giả mạo.',
    createdAt: '2026-09-17T07:18:32.000Z'
  },
  {
    id: 'SURVEY-REAL-010',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1370',
    isAnonymous: true,
    anonymousCode: 'VN-1370',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'CLICKED_SUSPICIOUS_LINK',
      preConfidenceScore: 60,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 3.6,
      experiencedSectors: ['KV9'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'C_NEAR_MISS', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'F', q3: 'C', q4: 'F', q5: 'B', q6: 'A',
        q7: 'B', q8: 'A', q9: 'A', q10: 'E', q11: 'C', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 60,
      postScore: 93,
      unseenScore: 89,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.2,
      scamDnaShift: {
        before: { T: 0.66, A: 0.62, G: 0.54, E: 0.65, C: 0.58, R: 0.52 },
        after: { T: 0.15, A: 0.13, G: 0.12, E: 0.14, C: 0.13, R: 0.11 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-8998, 10A4 THPT Nguyễn Khuyến. Cẩn trọng trước video call Deepfake.',
    createdAt: '2026-09-17T07:20:03.000Z'
  },
  {
    id: 'SURVEY-REAL-011',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1407',
    isAnonymous: true,
    anonymousCode: 'VN-1407',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A10',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'CLICKED_SUSPICIOUS_LINK',
      preConfidenceScore: 60,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.4,
      experiencedSectors: ['KV1', 'KV7', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'C_NEAR_MISS', q3: 'C_NEAR_MISS', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'B_SAFE', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'E', q2: 'C', q3: 'E', q4: 'C', q5: 'A', q6: 'F',
        q7: 'C', q8: 'D', q9: 'B', q10: 'A', q11: 'C', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 62,
      postScore: 92,
      unseenScore: 88,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.7,
      scamDnaShift: {
        before: { T: 0.68, A: 0.64, G: 0.52, E: 0.60, C: 0.56, R: 0.50 },
        after: { T: 0.15, A: 0.14, G: 0.12, E: 0.15, C: 0.13, R: 0.11 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-3667, 10A10 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:20:07.000Z'
  },
  {
    id: 'SURVEY-REAL-012',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1444',
    isAnonymous: true,
    anonymousCode: 'VN-1444',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'IMMEDIATE_ACTION',
      timeToDecidePreSec: 3.5,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'B_SAFE', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'B_SAFE', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'D', q4: 'A', q5: 'A', q6: 'B',
        q7: 'D', q8: 'A', q9: 'E', q10: 'C', q11: 'A', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 50,
      postScore: 89,
      unseenScore: 85,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.5,
      scamDnaShift: {
        before: { T: 0.70, A: 0.72, G: 0.55, E: 0.60, C: 0.62, R: 0.58 },
        after: { T: 0.16, A: 0.15, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Học sinh 10A4 THPT Nguyễn Khuyến (Ẩn danh).',
    createdAt: '2026-09-17T07:20:07.001Z'
  },
  {
    id: 'SURVEY-REAL-013',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1481',
    isAnonymous: true,
    anonymousCode: 'VN-1481',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TPHCM',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 100,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.1,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'A', q4: 'A', q5: 'A', q6: 'A',
        q7: 'A', q8: 'A', q9: 'A', q10: 'A', q11: 'A', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 40,
      postScore: 90,
      unseenScore: 86,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.75, A: 0.70, G: 0.60, E: 0.65, C: 0.68, R: 0.62 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.11 }
      }
    },
    feedbackNote: 'Hoàng An Bảo, 10A4 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:20:07.002Z'
  },
  {
    id: 'SURVEY-REAL-014',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1518',
    isAnonymous: true,
    anonymousCode: 'VN-1518',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A6',
    demographicGroup: 'STUDENT',
    location: 'Phường An Lạc, Thành Phố Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 60,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.3,
      experiencedSectors: ['KV1', 'KV2', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'B_SAFE', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'B_SAFE',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'D', q4: 'C', q5: 'E', q6: 'E',
        q7: 'A', q8: 'C', q9: 'D', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 78,
      postScore: 98,
      unseenScore: 94,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.0,
      scamDnaShift: {
        before: { T: 0.48, A: 0.52, G: 0.40, E: 0.46, C: 0.45, R: 0.38 },
        after: { T: 0.10, A: 0.09, G: 0.08, E: 0.10, C: 0.09, R: 0.08 }
      }
    },
    feedbackNote: 'Tường Vy, 10A6 THPT Nguyễn Khuyến. Điểm ứng biến phòng vệ rất cao (nhiều đáp án chính xác).',
    createdAt: '2026-09-17T07:20:24.000Z'
  },
  {
    id: 'SURVEY-REAL-015',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1555',
    isAnonymous: true,
    anonymousCode: 'VN-1555',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A10',
    demographicGroup: 'STUDENT',
    location: 'TO.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 80,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1', 'KV2'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'B_SAFE',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'B_SAFE', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'E', q3: 'E', q4: 'C', q5: 'E', q6: 'B',
        q7: 'E', q8: 'F', q9: 'A', q10: 'E', q11: 'B', q12: 'C'
      }
    },
    testOutcome: {
      preScore: 65,
      postScore: 94,
      unseenScore: 91,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.5,
      scamDnaShift: {
        before: { T: 0.60, A: 0.65, G: 0.50, E: 0.56, C: 0.52, R: 0.48 },
        after: { T: 0.13, A: 0.12, G: 0.11, E: 0.13, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Huỳnh Minh Quân, 10A10 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:20:25.000Z'
  },
  {
    id: 'SURVEY-REAL-016',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1592',
    isAnonymous: true,
    anonymousCode: 'VN-1592',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 20,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.5,
      experiencedSectors: ['KV2', 'KV3'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'E', q3: 'D', q4: 'C', q5: 'E', q6: 'B',
        q7: 'E', q8: 'C', q9: 'D', q10: 'E', q11: 'D', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 82,
      postScore: 99,
      unseenScore: 96,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 10.8,
      scamDnaShift: {
        before: { T: 0.45, A: 0.50, G: 0.38, E: 0.42, C: 0.40, R: 0.35 },
        after: { T: 0.08, A: 0.07, G: 0.07, E: 0.09, C: 0.08, R: 0.07 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #vuabakhi, 10A4 THPT Nguyễn Khuyến. Phản xạ phòng vệ cực tốt.',
    createdAt: '2026-09-17T07:20:26.000Z'
  },
  {
    id: 'SURVEY-REAL-017',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1629',
    isAnonymous: true,
    anonymousCode: 'VN-1629',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'LOST_MONEY',
      preConfidenceScore: 60,
      biggestFearTactic: 'TELEGRAM_INCOME',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.0,
      experiencedSectors: ['KV5', 'KV9'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'B_SAFE', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'F', q3: 'B', q4: 'B', q5: 'C', q6: 'A',
        q7: 'C', q8: 'C', q9: 'D', q10: 'C', q11: 'E', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 54,
      postScore: 90,
      unseenScore: 86,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.6,
      scamDnaShift: {
        before: { T: 0.72, A: 0.65, G: 0.70, E: 0.64, C: 0.62, R: 0.58 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Ẩn danh 10A4 THPT Nguyễn Khuyến. Từng chịu thiệt hại và lo lắng về bẫy kiếm tiền hoa hồng Telegram.',
    createdAt: '2026-09-17T07:20:47.000Z'
  },
  {
    id: 'SURVEY-REAL-018',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1666',
    isAnonymous: true,
    anonymousCode: 'VN-1666',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A3',
    demographicGroup: 'STUDENT',
    location: 'Tp.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'LOST_MONEY',
      preConfidenceScore: 40,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.2,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'D', q4: 'C', q5: 'E', q6: 'F',
        q7: 'D', q8: 'C', q9: 'A', q10: 'E', q11: 'C', q12: 'C'
      }
    },
    testOutcome: {
      preScore: 64,
      postScore: 92,
      unseenScore: 89,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.70, A: 0.65, G: 0.58, E: 0.72, C: 0.56, R: 0.55 },
        after: { T: 0.15, A: 0.14, G: 0.12, E: 0.16, C: 0.13, R: 0.11 }
      }
    },
    feedbackNote: 'Nguyễn Tường Nghi, 10A3 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:20:52.000Z'
  },
  {
    id: 'SURVEY-REAL-019',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1703',
    isAnonymous: true,
    anonymousCode: 'VN-1703',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A9',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.5,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'B_SAFE', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'E', q3: 'D', q4: 'C', q5: 'E', q6: 'C',
        q7: 'E', q8: 'C', q9: 'D', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 92,
      postScore: 100,
      unseenScore: 98,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 9.8,
      scamDnaShift: {
        before: { T: 0.35, A: 0.38, G: 0.30, E: 0.35, C: 0.32, R: 0.28 },
        after: { T: 0.05, A: 0.05, G: 0.04, E: 0.06, C: 0.05, R: 0.04 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-2510, 10A9 THPT Nguyễn Khuyến. Đạt độ chính xác 11/12 câu.',
    createdAt: '2026-09-17T07:20:54.000Z'
  },
  {
    id: 'SURVEY-REAL-020',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1740',
    isAnonymous: true,
    anonymousCode: 'VN-1740',
    schoolName: 'THPT Nguyễn Khuyến',
    className: 'Lớp 10A10',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 100,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV6', 'KV8', 'KV9'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'B_SAFE', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'B_SAFE', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'E', q2: 'A', q3: 'D', q4: 'B', q5: 'C', q6: 'B',
        q7: 'D', q8: 'A', q9: 'A', q10: 'E', q11: 'C', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 56,
      postScore: 92,
      unseenScore: 88,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.65, A: 0.62, G: 0.55, E: 0.60, C: 0.58, R: 0.52 },
        after: { T: 0.14, A: 0.13, G: 0.12, E: 0.14, C: 0.13, R: 0.10 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #VN-1412, Lớp 10A10 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:21:10.000Z'
  },
  {
    id: 'SURVEY-REAL-021',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1777',
    isAnonymous: true,
    anonymousCode: 'VN-1777',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 3.7,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'B', q3: 'C', q4: 'D', q5: 'E', q6: 'F',
        q7: 'A', q8: 'B', q9: 'C', q10: 'C', q11: 'D', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 52,
      postScore: 90,
      unseenScore: 86,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.3,
      scamDnaShift: {
        before: { T: 0.70, A: 0.68, G: 0.54, E: 0.62, C: 0.65, R: 0.56 },
        after: { T: 0.16, A: 0.15, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Huỳnh Tuấn Tú, 10A4 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:21:38.000Z'
  },
  {
    id: 'SURVEY-REAL-022',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1814',
    isAnonymous: true,
    anonymousCode: 'VN-1814',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'Tp Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 20,
      biggestFearTactic: 'TELEGRAM_INCOME',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.3,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'C', q3: 'B', q4: 'F', q5: 'B', q6: 'E',
        q7: 'B', q8: 'E', q9: 'B', q10: 'E', q11: 'B', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 48,
      postScore: 88,
      unseenScore: 84,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 13.0,
      scamDnaShift: {
        before: { T: 0.78, A: 0.70, G: 0.68, E: 0.66, C: 0.70, R: 0.65 },
        after: { T: 0.17, A: 0.15, G: 0.14, E: 0.16, C: 0.15, R: 0.13 }
      }
    },
    feedbackNote: 'Ẩn danh 10A4 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:22:25.000Z'
  },
  {
    id: 'SURVEY-REAL-023',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1851',
    isAnonymous: true,
    anonymousCode: 'VN-1851',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'Tp. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 40,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 3.9,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'B_SAFE', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'D', q2: 'D', q3: 'D', q4: 'E', q5: 'E', q6: 'F',
        q7: 'E', q8: 'C', q9: 'D', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 75,
      postScore: 96,
      unseenScore: 92,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.4,
      scamDnaShift: {
        before: { T: 0.52, A: 0.55, G: 0.44, E: 0.50, C: 0.46, R: 0.42 },
        after: { T: 0.11, A: 0.10, G: 0.09, E: 0.11, C: 0.10, R: 0.09 }
      }
    },
    feedbackNote: 'Võ Ngô Khánh Thư, 10A4 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:23:37.000Z'
  },
  {
    id: 'SURVEY-REAL-024',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1888',
    isAnonymous: true,
    anonymousCode: 'VN-1888',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10L1',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 100,
      biggestFearTactic: 'TELEGRAM_INCOME',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.1,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'D', q4: 'C', q5: 'A', q6: 'E',
        q7: 'E', q8: 'C', q9: 'A', q10: 'B', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 65,
      postScore: 94,
      unseenScore: 90,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.6,
      scamDnaShift: {
        before: { T: 0.62, A: 0.60, G: 0.50, E: 0.56, C: 0.54, R: 0.48 },
        after: { T: 0.13, A: 0.12, G: 0.11, E: 0.13, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Huỳnh Thị Ngọc Lan, 10L1 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:23:39.000Z'
  },
  {
    id: 'SURVEY-REAL-025',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1925',
    isAnonymous: true,
    anonymousCode: 'VN-1925',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A3',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 80,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.3,
      experiencedSectors: ['KV2', 'KV8'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'C', q3: 'D', q4: 'C', q5: 'E', q6: 'B',
        q7: 'A', q8: 'C', q9: 'B', q10: 'E', q11: 'C', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 70,
      postScore: 95,
      unseenScore: 91,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.2,
      scamDnaShift: {
        before: { T: 0.58, A: 0.62, G: 0.48, E: 0.54, C: 0.50, R: 0.46 },
        after: { T: 0.12, A: 0.11, G: 0.10, E: 0.12, C: 0.11, R: 0.09 }
      }
    },
    feedbackNote: 'Nguyễn Hồng Hạnh My, 10A3 THPT Nguyễn Khuyến Q10.',
    createdAt: '2026-09-17T07:23:55.000Z'
  },
  {
    id: 'SURVEY-REAL-026',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1962',
    isAnonymous: true,
    anonymousCode: 'VN-1962',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP.HCM',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'TELEGRAM_INCOME',
      verificationHabitPre: 'ASK_FRIENDS',
      timeToDecidePreSec: 3.7,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6', 'KV7', 'KV8', 'KV9', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'B_SAFE',
        q5: 'B_SAFE', q6: 'A_NEVER', q7: 'B_SAFE', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'B', q2: 'A', q3: 'C', q4: 'B', q5: 'E', q6: 'F',
        q7: 'C', q8: 'D', q9: 'E', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 62,
      postScore: 93,
      unseenScore: 89,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.8,
      scamDnaShift: {
        before: { T: 0.65, A: 0.60, G: 0.55, E: 0.58, C: 0.56, R: 0.52 },
        after: { T: 0.14, A: 0.13, G: 0.12, E: 0.14, C: 0.13, R: 0.10 }
      }
    },
    feedbackNote: 'Nguyễn Kim Khánh, Lớp 10A4 Trường THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:24:02.000Z'
  },
  {
    id: 'SURVEY-REAL-027',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-1999',
    isAnonymous: true,
    anonymousCode: 'VN-1999',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A8',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 60,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.6,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'A', q3: 'D', q4: 'E', q5: 'E', q6: 'A',
        q7: 'D', q8: 'D', q9: 'F', q10: 'A', q11: 'E', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 50,
      postScore: 89,
      unseenScore: 85,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.5,
      scamDnaShift: {
        before: { T: 0.70, A: 0.65, G: 0.58, E: 0.62, C: 0.64, R: 0.56 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Nguyễn Tuấn Anh, THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:24:06.000Z'
  },
  {
    id: 'SURVEY-REAL-028',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2036',
    isAnonymous: true,
    anonymousCode: 'VN-2036',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A10',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 60,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.1,
      experiencedSectors: ['KV6', 'KV7', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'C', q2: 'C', q3: 'D', q4: 'C', q5: 'A', q6: 'E',
        q7: 'D', q8: 'C', q9: 'A', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 68,
      postScore: 94,
      unseenScore: 90,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.5,
      scamDnaShift: {
        before: { T: 0.60, A: 0.62, G: 0.50, E: 0.55, C: 0.52, R: 0.48 },
        after: { T: 0.13, A: 0.12, G: 0.11, E: 0.13, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Khảo nghiệm viên Ẩn danh #Sbsjsndbskn, 10A10 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:24:32.000Z'
  },
  {
    id: 'SURVEY-REAL-029',
    participantName: 'Hồng Nguyệt Yến',
    isAnonymous: false,
    anonymousCode: '',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A1',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 80,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1', 'KV2', 'KV3'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'A', q3: 'D', q4: 'D', q5: 'C', q6: 'B',
        q7: 'E', q8: 'C', q9: 'A', q10: 'B', q11: 'C', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 58,
      postScore: 92,
      unseenScore: 88,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.9,
      scamDnaShift: {
        before: { T: 0.65, A: 0.62, G: 0.52, E: 0.60, C: 0.55, R: 0.50 },
        after: { T: 0.14, A: 0.13, G: 0.11, E: 0.14, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Hồng Nguyệt Yến, 10A1 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:25:02.000Z'
  },
  {
    id: 'SURVEY-REAL-030',
    participantName: 'Nguyễn Ngọc Phương Uyên',
    isAnonymous: false,
    anonymousCode: '',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A4',
    demographicGroup: 'STUDENT',
    location: 'TP.HCM',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 40,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.1,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'F', q3: 'D', q4: 'C', q5: 'E', q6: 'C',
        q7: 'A', q8: 'A', q9: 'B', q10: 'E', q11: 'C', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 60,
      postScore: 91,
      unseenScore: 87,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.3,
      scamDnaShift: {
        before: { T: 0.68, A: 0.64, G: 0.55, E: 0.62, C: 0.60, R: 0.54 },
        after: { T: 0.15, A: 0.14, G: 0.12, E: 0.15, C: 0.13, R: 0.11 }
      }
    },
    feedbackNote: 'Nguyễn Ngọc Phương Uyên, 10A4 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:25:13.000Z'
  },
  {
    id: 'SURVEY-REAL-031',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2147',
    isAnonymous: true,
    anonymousCode: 'VN-2147',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A1',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 60,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.4,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'B', q2: 'C', q3: 'D', q4: 'C', q5: 'C', q6: 'F',
        q7: 'D', q8: 'C', q9: 'D', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 75,
      postScore: 97,
      unseenScore: 93,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 11.0,
      scamDnaShift: {
        before: { T: 0.50, A: 0.54, G: 0.42, E: 0.48, C: 0.45, R: 0.40 },
        after: { T: 0.10, A: 0.09, G: 0.08, E: 0.10, C: 0.09, R: 0.08 }
      }
    },
    feedbackNote: 'Lương Kim Chi, 10A1 THPT Nguyễn Khuyến. Điểm ứng biến rất cao.',
    createdAt: '2026-09-17T07:26:27.000Z'
  },
  {
    id: 'SURVEY-REAL-032',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2184',
    isAnonymous: true,
    anonymousCode: 'VN-2184',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A1',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 80,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'C', q2: 'E', q3: 'D', q4: 'C', q5: 'E', q6: 'F',
        q7: 'E', q8: 'C', q9: 'D', q10: 'C', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 92,
      postScore: 100,
      unseenScore: 97,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 10.2,
      scamDnaShift: {
        before: { T: 0.38, A: 0.40, G: 0.32, E: 0.36, C: 0.34, R: 0.30 },
        after: { T: 0.06, A: 0.05, G: 0.05, E: 0.07, C: 0.06, R: 0.05 }
      }
    },
    feedbackNote: 'Ẩn danh 10A1 THPT Nguyễn Khuyến. Đạt 11/12 câu chuẩn xác.',
    createdAt: '2026-09-17T07:31:01.000Z'
  },
  {
    id: 'SURVEY-REAL-033',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2221',
    isAnonymous: true,
    anonymousCode: 'VN-2221',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A7',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 50,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.2,
      experiencedSectors: ['KV2', 'KV3', 'KV6', 'KV7', 'KV8', 'KV9', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'B_SAFE', q8: 'B_SAFE',
        q9: 'B_SAFE', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'C', q3: 'D', q4: 'B', q5: 'E', q6: 'D',
        q7: 'F', q8: 'C', q9: 'D', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 68,
      postScore: 93,
      unseenScore: 89,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.62, A: 0.68, G: 0.52, E: 0.58, C: 0.55, R: 0.50 },
        after: { T: 0.14, A: 0.13, G: 0.11, E: 0.13, C: 0.12, R: 0.10 }
      }
    },
    feedbackNote: 'Ẩn danh 10A7 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:40:53.000Z'
  },
  {
    id: 'SURVEY-REAL-034',
    participantName: 'Dư Gia Bảo',
    isAnonymous: false,
    anonymousCode: '',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A2',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 60,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.5,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6', 'KV7', 'KV8', 'KV9', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'B_SAFE', q3: 'B_SAFE', q4: 'B_SAFE',
        q5: 'B_SAFE', q6: 'B_SAFE', q7: 'B_SAFE', q8: 'B_SAFE',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'B_SAFE', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'A', q2: 'E', q3: 'D', q4: 'C', q5: 'E', q6: 'F',
        q7: 'E', q8: 'C', q9: 'B', q10: 'E', q11: 'C', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 85,
      postScore: 98,
      unseenScore: 95,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 10.5,
      scamDnaShift: {
        before: { T: 0.42, A: 0.45, G: 0.35, E: 0.40, C: 0.38, R: 0.34 },
        after: { T: 0.08, A: 0.08, G: 0.07, E: 0.09, C: 0.08, R: 0.07 }
      }
    },
    feedbackNote: 'Dư Gia Bảo, 10A2 THPT Nguyễn Khuyến. Nắm rất vững các nguyên tắc kiểm chứng.',
    createdAt: '2026-09-17T07:43:48.000Z'
  },
  {
    id: 'SURVEY-REAL-035',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2295',
    isAnonymous: true,
    anonymousCode: 'VN-2295',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A7',
    demographicGroup: 'STUDENT',
    location: 'TP.Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'CLICKED_SUSPICIOUS_LINK',
      preConfidenceScore: 80,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.4,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'E', q3: 'D', q4: 'C', q5: 'E', q6: 'F',
        q7: 'B', q8: 'B', q9: 'F', q10: 'C', q11: 'F', q12: 'C'
      }
    },
    testOutcome: {
      preScore: 58,
      postScore: 91,
      unseenScore: 87,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.2,
      scamDnaShift: {
        before: { T: 0.66, A: 0.60, G: 0.54, E: 0.65, C: 0.58, R: 0.52 },
        after: { T: 0.15, A: 0.13, G: 0.12, E: 0.14, C: 0.13, R: 0.10 }
      }
    },
    feedbackNote: 'Ẩn danh 10A7 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:44:13.000Z'
  },
  {
    id: 'SURVEY-REAL-036',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2332',
    isAnonymous: true,
    anonymousCode: 'VN-2332',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A1',
    demographicGroup: 'STUDENT',
    location: 'TP HỒ CHÍ MINH',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 100,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.0,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6', 'KV7', 'KV8', 'KV9', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'A', q2: 'A', q3: 'C', q4: 'D', q5: 'C', q6: 'E',
        q7: 'F', q8: 'A', q9: 'B', q10: 'C', q11: 'A', q12: 'D'
      }
    },
    testOutcome: {
      preScore: 42,
      postScore: 89,
      unseenScore: 85,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.8,
      scamDnaShift: {
        before: { T: 0.75, A: 0.68, G: 0.58, E: 0.64, C: 0.66, R: 0.60 },
        after: { T: 0.17, A: 0.15, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Học sinh 10A1 THPT Nguyễn Khuyến.',
    createdAt: '2026-09-17T07:44:52.000Z'
  },
  {
    id: 'SURVEY-REAL-037',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2369',
    isAnonymous: true,
    anonymousCode: 'VN-2369',
    schoolName: 'THPT Nguyễn Khuyến',
    className: 'Lớp 10a7',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 10,
      biggestFearTactic: 'DEEPFAKE_CALL',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.6,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'A_NEVER', q11: 'A_NEVER', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'E', q2: 'B', q3: 'D', q4: 'C', q5: 'E', q6: 'B',
        q7: 'A', q8: 'F', q9: 'E', q10: 'B', q11: 'A', q12: 'E'
      }
    },
    testOutcome: {
      preScore: 48,
      postScore: 87,
      unseenScore: 83,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 13.5,
      scamDnaShift: {
        before: { T: 0.82, A: 0.76, G: 0.65, E: 0.72, C: 0.70, R: 0.68 },
        after: { T: 0.18, A: 0.16, G: 0.15, E: 0.17, C: 0.16, R: 0.14 }
      }
    },
    feedbackNote: 'Ẩn danh #toibideptrai, Lớp 10A7 THPT Nguyễn Khuyến. Độ tự tin ban đầu 10%.',
    createdAt: '2026-09-17T07:47:03.000Z'
  },
  {
    id: 'SURVEY-REAL-038',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2406',
    isAnonymous: true,
    anonymousCode: 'VN-2406',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10B2',
    demographicGroup: 'STUDENT',
    location: 'TP HỒ CHÍ MINH',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 100,
      biggestFearTactic: 'URGENT_ACCIDENT',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.1,
      experiencedSectors: [],
      experienceAnswers: {
        q1: 'C_NEAR_MISS', q2: 'A_NEVER', q3: 'A_NEVER', q4: 'A_NEVER',
        q5: 'A_NEVER', q6: 'A_NEVER', q7: 'A_NEVER', q8: 'A_NEVER',
        q9: 'A_NEVER', q10: 'D_VICTIM', q11: 'C_NEAR_MISS', q12: 'A_NEVER'
      },
      trapAnswers: {
        q1: 'B', q2: 'F', q3: 'A', q4: 'A', q5: 'F', q6: 'B',
        q7: 'A', q8: 'D', q9: 'F', q10: 'F', q11: 'B', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 38,
      postScore: 90,
      unseenScore: 86,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.6,
      scamDnaShift: {
        before: { T: 0.74, A: 0.65, G: 0.60, E: 0.66, C: 0.68, R: 0.62 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.12 }
      }
    },
    feedbackNote: 'Học sinh 10B2 THPT Nguyễn Khuyến. Từng chịu thiệt hại ví Web3, suýt bị lừa ở SMS và USB.',
    createdAt: '2026-09-17T07:47:44.000Z'
  },
  {
    id: 'SURVEY-REAL-039',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2443',
    isAnonymous: true,
    anonymousCode: 'VN-2443',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '10A2',
    demographicGroup: 'STUDENT',
    location: 'TP Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: false,
      pastLossOrNearMiss: 'NEVER',
      preConfidenceScore: 20,
      biggestFearTactic: 'FAKE_BILL_QR',
      verificationHabitPre: 'CONFUSED',
      timeToDecidePreSec: 4.4,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV6'],
      experienceAnswers: {
        q1: 'A_NEVER', q2: 'B_SAFE', q3: 'D_VICTIM', q4: 'A_NEVER',
        q5: 'C_NEAR_MISS', q6: 'A_NEVER', q7: 'B_SAFE', q8: 'D_VICTIM',
        q9: 'B_SAFE', q10: 'D_VICTIM', q11: 'A_NEVER', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'E', q2: 'A', q3: 'B', q4: 'D', q5: 'C', q6: 'B',
        q7: 'F', q8: 'D', q9: 'B', q10: 'F', q11: 'D', q12: 'A'
      }
    },
    testOutcome: {
      preScore: 35,
      postScore: 86,
      unseenScore: 82,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 13.8,
      scamDnaShift: {
        before: { T: 0.82, A: 0.74, G: 0.68, E: 0.75, C: 0.74, R: 0.70 },
        after: { T: 0.19, A: 0.17, G: 0.16, E: 0.18, C: 0.17, R: 0.14 }
      }
    },
    feedbackNote: 'Ẩn danh #VN-6567, 10A2 THPT Nguyễn Khuyến. Từng chịu thiệt hại giao hàng COD và sự cố khẩn cấp.',
    createdAt: '2026-09-17T07:48:22.000Z'
  },
  {
    id: 'SURVEY-REAL-040',
    participantName: 'Khảo nghiệm viên Ẩn danh #VN-2480',
    isAnonymous: true,
    anonymousCode: 'VN-2480',
    schoolName: 'THPT Nguyễn Khuyến',
    className: '11L1',
    demographicGroup: 'STUDENT',
    location: 'TP. Hồ Chí Minh',
    consentAgreed: true,
    surveyResponses: {
      everEncounteredScam: true,
      pastLossOrNearMiss: 'SPOTTED_IN_TIME',
      preConfidenceScore: 100,
      biggestFearTactic: 'AUTHORITY_POLICE',
      verificationHabitPre: 'DOUBLE_CHECK_OFFICIAL',
      timeToDecidePreSec: 3.2,
      experiencedSectors: ['KV1', 'KV2', 'KV3', 'KV4', 'KV5', 'KV6', 'KV7', 'KV8', 'KV9', 'KV10', 'KV11', 'KV12'],
      experienceAnswers: {
        q1: 'B_SAFE', q2: 'B_SAFE', q3: 'B_SAFE', q4: 'B_SAFE',
        q5: 'B_SAFE', q6: 'B_SAFE', q7: 'B_SAFE', q8: 'B_SAFE',
        q9: 'B_SAFE', q10: 'B_SAFE', q11: 'B_SAFE', q12: 'B_SAFE'
      },
      trapAnswers: {
        q1: 'E', q2: 'A', q3: 'F', q4: 'A', q5: 'B', q6: 'A',
        q7: 'A', q8: 'C', q9: 'B', q10: 'C', q11: 'C', q12: 'B'
      }
    },
    testOutcome: {
      preScore: 50,
      postScore: 91,
      unseenScore: 87,
      unsafeActionAvoided: true,
      timeToDecidePostSec: 12.0,
      scamDnaShift: {
        before: { T: 0.68, A: 0.65, G: 0.58, E: 0.60, C: 0.62, R: 0.55 },
        after: { T: 0.16, A: 0.14, G: 0.13, E: 0.15, C: 0.14, R: 0.11 }
      }
    },
    feedbackNote: 'Khảo sát bên ngoài (Nhóm Kinh doanh Online).',
    createdAt: '2026-09-17T12:02:29.000Z'
  }
];
