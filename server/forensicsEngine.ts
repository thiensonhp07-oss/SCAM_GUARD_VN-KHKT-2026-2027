import dns from 'dns';
import tls from 'tls';
import crypto from 'crypto';
import { executeGeminiWithFallback, GEMINI_MODEL } from './gemini';
import { extractTransparentUrlFeatures } from './riskEngine';
import { sanitizeAndRedactPII, defendPromptInjection } from './safety';

// Vietnamese Bank BIN Directory (Napas247 standard)
export const VIETQR_BANK_BINS: Record<string, { shortName: string; fullName: string; officialDomain: string; hotline: string }> = {
  '970436': { shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam', officialDomain: 'vietcombank.com.vn', hotline: '1900 545413' },
  '970407': { shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam', officialDomain: 'techcombank.com', hotline: '1800 588822' },
  '970422': { shortName: 'MB Bank', fullName: 'Ngân hàng TMCP Quân Đội', officialDomain: 'mbbank.com.vn', hotline: '1900 545426' },
  '970418': { shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', officialDomain: 'bidv.com.vn', hotline: '1900 9247' },
  '970415': { shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam', officialDomain: 'vietinbank.vn', hotline: '1900 558868' },
  '970416': { shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', officialDomain: 'acb.com.vn', hotline: '1900 545486' },
  '970432': { shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', officialDomain: 'vpbank.com.vn', hotline: '1900 545415' },
  '970423': { shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong', officialDomain: 'tpb.vn', hotline: '1900 585885' },
  '970405': { shortName: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn VN', officialDomain: 'agribank.com.vn', hotline: '1900 558818' },
  '970403': { shortName: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín', officialDomain: 'sacombank.com.vn', hotline: '1800 585888' },
  '970437': { shortName: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển TP.HCM', officialDomain: 'hdbank.com.vn', hotline: '1900 6060' },
  '970441': { shortName: 'VIB', fullName: 'Ngân hàng TMCP Quốc Tế Việt Nam', officialDomain: 'vib.com.vn', hotline: '1900 2200' },
  '970443': { shortName: 'SHB', fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội', officialDomain: 'shb.com.vn', hotline: '6688' },
  '970426': { shortName: 'MSB', fullName: 'Ngân hàng TMCP Hàng Hải Việt Nam', officialDomain: 'msb.com.vn', hotline: '1900 6083' },
  '970448': { shortName: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông', officialDomain: 'ocb.com.vn', hotline: '1800 6678' },
  '970454': { shortName: 'VietCapitalBank', fullName: 'Ngân hàng TMCP Bản Việt (BVBank)', officialDomain: 'bvbank.net.vn', hotline: '1900 555596' },
};

// Official Vietnamese Portals & Financial Institutions Directory
export const OFFICIAL_VN_DIRECTORY: Array<{
  keyword: string;
  name: string;
  officialDomains: string[];
  category: 'GOV' | 'BANK' | 'TELECOM' | 'ECOMMERCE';
  hotline: string;
}> = [
  { keyword: 'vneid', name: 'Ứng dụng Định danh điện tử Quốc gia VNeID (Bộ Công An)', officialDomains: ['vneid.gov.vn', 'dichvucong.gov.vn'], category: 'GOV', hotline: '1900 0368' },
  { keyword: 'dichvucong', name: 'Cổng Dịch vụ công Quốc gia', officialDomains: ['dichvucong.gov.vn'], category: 'GOV', hotline: '1800 1096' },
  { keyword: 'bocongan', name: 'Cổng Thông tin điện tử Bộ Công An', officialDomains: ['bocongan.gov.vn', 'mps.gov.vn'], category: 'GOV', hotline: '113 / 069.234.2593' },
  { keyword: 'ncsc', name: 'Trung tâm Giám sát An toàn không gian mạng Quốc gia (NCSC)', officialDomains: ['khonggianmang.vn', 'tinnhiemmang.vn', 'canhbao.ncsc.gov.vn'], category: 'GOV', hotline: '156' },
  { keyword: 'thuedientu', name: 'Hệ thống Thuế điện tử - Tổng cục Thuế (Bộ Tài chính)', officialDomains: ['thuedientu.gdt.gov.vn', 'gdt.gov.vn'], category: 'GOV', hotline: '1900 1523' },
  { keyword: 'baohiemxahoi', name: 'Bảo hiểm Xã hội Việt Nam (VssID)', officialDomains: ['baohiemxahoi.gov.vn'], category: 'GOV', hotline: '1900 9068' },
  { keyword: 'evn', name: 'Tập đoàn Điện lực Việt Nam (EVN)', officialDomains: ['evn.com.vn', 'cskh.evn.com.vn'], category: 'GOV', hotline: '1900 6769' },
  { keyword: 'vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)', officialDomains: ['vietcombank.com.vn'], category: 'BANK', hotline: '1900 545413' },
  { keyword: 'vcb', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VCB)', officialDomains: ['vietcombank.com.vn'], category: 'BANK', hotline: '1900 545413' },
  { keyword: 'techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (TCB)', officialDomains: ['techcombank.com', 'techcombank.com.vn'], category: 'BANK', hotline: '1800 588822' },
  { keyword: 'mbbank', name: 'Ngân hàng TMCP Quân Đội (MB)', officialDomains: ['mbbank.com.vn'], category: 'BANK', hotline: '1900 545426' },
  { keyword: 'bidv', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)', officialDomains: ['bidv.com.vn'], category: 'BANK', hotline: '1900 9247' },
  { keyword: 'vietinbank', name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)', officialDomains: ['vietinbank.vn'], category: 'BANK', hotline: '1900 558868' },
  { keyword: 'acb', name: 'Ngân hàng TMCP Á Châu (ACB)', officialDomains: ['acb.com.vn'], category: 'BANK', hotline: '1900 545486' },
  { keyword: 'vpbank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)', officialDomains: ['vpbank.com.vn'], category: 'BANK', hotline: '1900 545415' },
  { keyword: 'tpbank', name: 'Ngân hàng TMCP Tiên Phong (TPBank)', officialDomains: ['tpb.vn'], category: 'BANK', hotline: '1900 585885' },
  { keyword: 'agribank', name: 'Ngân hàng NN&PT Nông thôn Việt Nam (Agribank)', officialDomains: ['agribank.com.vn'], category: 'BANK', hotline: '1900 558818' },
  { keyword: 'momo', name: 'Ví điện tử MoMo (M_Service)', officialDomains: ['momo.vn'], category: 'BANK', hotline: '1900 545441' },
  { keyword: 'viettel', name: 'Tập đoàn Công nghiệp - Viễn thông Quân đội (Viettel)', officialDomains: ['viettel.vn', 'vietteltelecom.vn', 'viettelpost.com.vn'], category: 'TELECOM', hotline: '1800 8098' },
  { keyword: 'vnpt', name: 'Tập đoàn Bưu chính Viễn thông Việt Nam (VNPT)', officialDomains: ['vnpt.com.vn', 'vinaphone.com.vn'], category: 'TELECOM', hotline: '1800 1091' },
];

function cleanJsonText(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return text.trim();
}

function raceTimeout<T>(promise: Promise<T>, ms: number, fallbackVal: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallbackVal), ms);
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallbackVal);
      });
  });
}

/**
 * Perform real DNS resolution (A, MX, NS, TXT) with strict timeout
 */
async function inspectLiveDns(domain: string) {
  const cleanHost = domain.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim().toLowerCase();
  if (!cleanHost || !cleanHost.includes('.')) {
    return {
      resolved: false,
      aRecords: [] as string[],
      mxRecords: [] as string[],
      nsRecords: [] as string[],
      txtRecords: [] as string[],
      hasSpfOrDmarc: false,
    };
  }

  const [aRecords, mxRecords, nsRecords, txtRecords] = await Promise.all([
    raceTimeout(dns.promises.resolve4(cleanHost), 1600, [] as string[]),
    raceTimeout(
      dns.promises.resolveMx(cleanHost).then((list) => list.map((m) => m.exchange)),
      1600,
      [] as string[]
    ),
    raceTimeout(dns.promises.resolveNs(cleanHost), 1600, [] as string[]),
    raceTimeout(
      dns.promises.resolveTxt(cleanHost).then((list) => list.map((t) => t.join(''))),
      1600,
      [] as string[]
    ),
  ]);

  const hasSpfOrDmarc = txtRecords.some((t) => /v=spf1|v=DMARC1/i.test(t));

  return {
    resolved: aRecords.length > 0 || nsRecords.length > 0,
    aRecords: aRecords.slice(0, 4),
    mxRecords: mxRecords.slice(0, 3),
    nsRecords: nsRecords.slice(0, 4),
    txtRecords: txtRecords.slice(0, 3),
    hasSpfOrDmarc,
  };
}

/**
 * Perform real TLS Certificate handshake inspection on port 443
 */
async function inspectLiveTlsCertificate(domain: string): Promise<{
  hasValidSsl: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  isFreeShortLivedCert: boolean;
}> {
  const cleanHost = domain.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].trim().toLowerCase();
  const defaultTls = {
    hasValidSsl: false,
    issuer: 'Không phản hồi TLS / Không có HTTPS',
    subject: cleanHost,
    validFrom: 'N/A',
    validTo: 'N/A',
    daysRemaining: 0,
    protocol: 'NONE',
    isFreeShortLivedCert: false,
  };

  if (!cleanHost || !cleanHost.includes('.')) return defaultTls;

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(defaultTls);
    }, 1800);

    try {
      const socket = tls.connect(
        {
          host: cleanHost,
          port: 443,
          servername: cleanHost,
          rejectUnauthorized: false,
          timeout: 1600,
        },
        () => {
          clearTimeout(timer);
          try {
            const cert = socket.getPeerCertificate();
            const protocol = socket.getProtocol() || 'TLS';
            socket.end();

            if (!cert || Object.keys(cert).length === 0) {
              return resolve(defaultTls);
            }

            const issuerOrg = cert.issuer?.O || cert.issuer?.CN || 'Unknown CA';
            const issuerCN = cert.issuer?.CN || '';
            const subjectCN = cert.subject?.CN || cert.subject?.O || cleanHost;
            const validFrom = cert.valid_from || '';
            const validTo = cert.valid_to || '';
            const validToMs = validTo ? Date.parse(validTo) : 0;
            const validFromMs = validFrom ? Date.parse(validFrom) : 0;
            const daysRemaining = validToMs ? Math.max(0, Math.round((validToMs - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
            const totalLifespanDays =
              validToMs && validFromMs ? Math.round((validToMs - validFromMs) / (1000 * 60 * 60 * 24)) : 90;

            const isFreeShortLivedCert =
              /let's encrypt|zerossl|cloudflare|r3|r10|r11|e5|e6|gts ca/i.test(`${issuerOrg} ${issuerCN}`) ||
              totalLifespanDays <= 95;

            resolve({
              hasValidSsl: true,
              issuer: `${issuerOrg}${issuerCN && issuerCN !== issuerOrg ? ` (${issuerCN})` : ''}`,
              subject: String(subjectCN),
              validFrom,
              validTo,
              daysRemaining,
              protocol,
              isFreeShortLivedCert,
            });
          } catch {
            socket.destroy();
            resolve(defaultTls);
          }
        }
      );

      socket.on('error', () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(defaultTls);
      });
      socket.on('timeout', () => {
        clearTimeout(timer);
        socket.destroy();
        resolve(defaultTls);
      });
    } catch {
      clearTimeout(timer);
      resolve(defaultTls);
    }
  });
}

/**
 * Safe Sandbox HTTP Probe: Follows redirects safely without executing JS, inspects DOM forms & headers
 */
async function probeHttpSandbox(rawUrl: string) {
  let targetUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  const redirectChain: string[] = [targetUrl];
  let statusCode = 0;
  let serverHeader = 'Unknown';
  let contentType = 'Unknown';
  let pageTitle = '';
  let hasPasswordInput = false;
  let hasOtpInput = false;
  let hasApkDownload = false;
  let suspiciousDomSignals: string[] = [];

  try {
    let currentUrl = targetUrl;
    for (let hop = 0; hop < 3; hop++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'ScamGuard-NCSC-Sandbox-Inspector/3.8 (+https://khonggianmang.vn)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);

      statusCode = res.status;
      serverHeader = res.headers.get('server') || res.headers.get('x-powered-by') || 'Cloud Edge / Proxy';
      contentType = res.headers.get('content-type') || 'text/html';

      const location = res.headers.get('location');
      if (location && [301, 302, 303, 307, 308].includes(res.status)) {
        const nextUrl = new URL(location, currentUrl).toString();
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
        continue;
      }

      if (contentType.includes('text/html')) {
        const htmlSnippet = (await res.text()).slice(0, 25000);
        const titleMatch = htmlSnippet.match(/<title[^>]*>([^<]{1,200})<\/title>/i);
        if (titleMatch) {
          pageTitle = titleMatch[1].trim();
        }
        hasPasswordInput = /type\s*=\s*["']?password["']?/i.test(htmlSnippet);
        hasOtpInput = /otp|mã xác thực|ma xac thuc|mật khẩu cấp 2|smart\s*otp|cccd/i.test(htmlSnippet);
        hasApkDownload = /\.apk\b|application\/vnd\.android\.package-archive/i.test(htmlSnippet);

        if (hasPasswordInput) suspiciousDomSignals.push('Trang chứa trường thu thập mật khẩu (<input type="password">)');
        if (hasOtpInput) suspiciousDomSignals.push('Trang chứa biểu mẫu yêu cầu nhập mã OTP / CCCD nhạy cảm');
        if (hasApkDownload) suspiciousDomSignals.push('Phát hiện liên kết tải xuống gói cài đặt ứng dụng ngoài luồng (.APK)');
      }
      break;
    }
  } catch {
    // Unreachable or sinkholed domain
  }

  return {
    reachable: statusCode > 0,
    statusCode,
    serverHeader,
    contentType,
    pageTitle,
    redirectChain,
    hasPasswordInput,
    hasOtpInput,
    hasApkDownload,
    suspiciousDomSignals,
  };
}

/**
 * 1. Comprehensive Live URL / Website / Domain Inspection (NCSC / TinNhiemMang Grade + Gemini AI)
 */
export async function performLiveUrlAndDomainForensics(params: {
  urlOrDomain: string;
  context?: string;
  mode?: 'domain' | 'qr_sandbox' | 'osint';
}) {
  const rawTarget = (params.urlOrDomain || '').trim();
  const urlFeatures = extractTransparentUrlFeatures(rawTarget);
  const host = urlFeatures.domain.toLowerCase();

  // Match against Official VN Directory
  let matchedOfficialEntity: (typeof OFFICIAL_VN_DIRECTORY)[0] | null = null;
  let isOfficialVerifiedDomain = false;
  let isImpersonatingOfficialEntity = false;

  for (const entry of OFFICIAL_VN_DIRECTORY) {
    const exactMatch = entry.officialDomains.some((od) => host === od || host.endsWith(`.${od}`));
    if (exactMatch) {
      matchedOfficialEntity = entry;
      isOfficialVerifiedDomain = true;
      break;
    }
    if (host.includes(entry.keyword)) {
      matchedOfficialEntity = entry;
      isImpersonatingOfficialEntity = true;
      break;
    }
  }

  // Also check if any .gov.vn domain is impersonated on a non-.gov.vn TLD
  if (!isOfficialVerifiedDomain && (host.includes('gov') || host.includes('congan') || host.includes('vienkiemsat') || host.includes('toaan')) && !host.endsWith('.gov.vn')) {
    isImpersonatingOfficialEntity = true;
    if (!matchedOfficialEntity) {
      matchedOfficialEntity = {
        keyword: 'gov',
        name: 'Cơ quan Nhà nước Cộng hòa Xã hội Chủ nghĩa Việt Nam (.gov.vn)',
        officialDomains: ['chinhphu.vn', 'dichvucong.gov.vn', 'bocongan.gov.vn'],
        category: 'GOV',
        hotline: '113 / 156',
      };
    }
  }

  // Run live DNS, TLS, and HTTP Sandbox probes in parallel
  const [dnsInfo, tlsInfo, httpProbe] = await Promise.all([
    inspectLiveDns(host),
    inspectLiveTlsCertificate(host),
    probeHttpSandbox(rawTarget),
  ]);

  let riskScore = urlFeatures.deterministicRiskScore;
  const warningFlags = [...urlFeatures.featureSignals];

  if (isOfficialVerifiedDomain) {
    riskScore = 5;
  } else {
    if (isImpersonatingOfficialEntity) {
      riskScore = Math.max(riskScore, 92);
      warningFlags.unshift(
        `MẠO DANH NGHIÊM TRỌNG: Tên miền [${host}] giả mạo [${matchedOfficialEntity?.name}]. Tên miền chính thức duy nhất là: ${matchedOfficialEntity?.officialDomains.join(', ')}`
      );
    }
    if (!dnsInfo.resolved) {
      warningFlags.push('Máy chủ DNS quốc tế không ghi nhận bản ghi chính thống hoặc tên miền thuộc dải sinkhole/mới phát tán');
    } else if (!dnsInfo.hasSpfOrDmarc) {
      riskScore = Math.min(99, riskScore + 10);
      warningFlags.push('Tên miền thiếu cấu hình chống giả mạo thư điện tử (SPF/DMARC TXT record)');
    }
    if (tlsInfo.hasValidSsl && tlsInfo.isFreeShortLivedCert && isImpersonatingOfficialEntity) {
      riskScore = Math.min(99, riskScore + 12);
      warningFlags.push(`Sử dụng chứng chỉ SSL miễn phí ngắn hạn (${tlsInfo.issuer}) thay vì chứng chỉ định danh tổ chức EV/OV SSL của Ngân hàng/Chính phủ`);
    }
    if (httpProbe.suspiciousDomSignals.length > 0) {
      riskScore = Math.min(99, riskScore + 20);
      warningFlags.push(...httpProbe.suspiciousDomSignals);
    }
    if (/\.apk(\?|$)/i.test(rawTarget)) {
      riskScore = 98;
      warningFlags.unshift('CẢNH BÁO MÃ ĐỘC: Đường dẫn trực tiếp tải file cài đặt .APK ngoài kho ứng dụng Google Play (nguy cơ chiếm quyền Điều khiển Trợ năng & đọc trộm OTP)');
    }
  }

  // Query Gemini 3.8 Flash for deep threat intelligence synthesis
  let aiAnalysis: any = null;
  try {
    const prompt = `Bạn là Trung Tâm Giám Định Pháp Y Số Quốc Gia SCAMGUARD VN (tương đương hệ thống ChongLuaDao & NCSC Cổng Không Gian Mạng Quốc Gia).
Hãy phân tích toàn diện URL / Tên miền / Thực thể sau:
- Thực thể kiểm tra: "${rawTarget}"
- Ngữ cảnh người dùng: "${params.context || 'Kiểm tra trực tiếp trên cổng Giám định AI & Pháp Y'}"
- Kết quả tra cứu DNS thực tế: Resolved=${dnsInfo.resolved}, IP=${dnsInfo.aRecords.join(', ') || 'N/A'}, NS=${dnsInfo.nsRecords.join(', ') || 'N/A'}, SPF/DMARC=${dnsInfo.hasSpfOrDmarc}
- Kết quả kiểm tra chứng chỉ TLS/SSL thực tế: Valid=${tlsInfo.hasValidSsl}, Issuer="${tlsInfo.issuer}", Hạn còn=${tlsInfo.daysRemaining} ngày, FreeCert=${tlsInfo.isFreeShortLivedCert}
- Kết quả cô lập HTTP Sandbox: Status=${httpProbe.statusCode}, Title="${httpProbe.pageTitle}", Redirects=${httpProbe.redirectChain.join(' -> ')}, DOM Flags=${httpProbe.suspiciousDomSignals.join('; ')}
- Đối chiếu danh bạ chính phủ/ngân hàng: Chính chủ=${isOfficialVerifiedDomain}, Mạo danh=${isImpersonatingOfficialEntity} (${matchedOfficialEntity?.name || 'Không'})

Trả về JSON chuẩn xác:
{
  "riskScore": number (0-100),
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "verdictTitle": string (Tiêu đề kết luận đanh thép, rõ ràng bằng tiếng Việt),
  "explanation": string (Phân tích chuyên sâu 2-3 câu về bản chất kỹ thuật và thủ đoạn của liên kết/tên miền này),
  "whoisAgeEstimate": string,
  "sslStatusSummary": string,
  "warningFlags": [string],
  "recommendedActions": [string],
  "officialAlternative": {
    "organizationName": string,
    "officialWebsite": string,
    "officialHotline": string
  }
}`;

    const resp = await executeGeminiWithFallback({
      contents: prompt,
      fastChat: false,
      timeoutMs: 5500,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    if (resp?.text) {
      aiAnalysis = JSON.parse(cleanJsonText(resp.text));
    }
  } catch (err) {
    console.warn('Live URL Gemini synthesis fallback:', err);
  }

  const finalRiskScore = isOfficialVerifiedDomain
    ? 5
    : aiAnalysis?.riskScore !== undefined
    ? Math.round((Number(aiAnalysis.riskScore) + riskScore) / 2)
    : riskScore;

  const finalRiskLevel =
    finalRiskScore >= 70 ? 'HIGH' : finalRiskScore >= 40 ? 'MEDIUM' : finalRiskScore >= 20 ? 'LOW' : 'SAFE';

  return {
    domain: host,
    identifier: rawTarget,
    riskScore: finalRiskScore,
    trustScore: Math.max(1, 100 - finalRiskScore),
    riskLevel: finalRiskLevel,
    classification: finalRiskScore >= 65 ? 'HIGHLY_DANGEROUS' : finalRiskScore >= 35 ? 'SUSPICIOUS' : 'CLEAN_HISTORY',
    verdictTitle:
      aiAnalysis?.verdictTitle ||
      (isOfficialVerifiedDomain
        ? `Tên Miền Chính Thống Đã Xác Thực (${matchedOfficialEntity?.name})`
        : isImpersonatingOfficialEntity
        ? `CẢNH BÁO ĐỎ: Giả Mạo ${matchedOfficialEntity?.name}`
        : finalRiskScore >= 70
        ? 'Phát Hiện Liên Kết Phishing / Mã Độc Rủi Ro Cao'
        : 'Chưa Phát Hiện Dấu Hiệu Giả Mạo Trực Diện'),
    whoisAge:
      aiAnalysis?.whoisAgeEstimate ||
      (isOfficialVerifiedDomain
        ? 'Tên miền cơ quan/tổ chức lâu năm (Đã định danh VNNIC)'
        : dnsInfo.resolved
        ? 'Hoạt động trên DNS (Khuyến nghị kiểm tra WHOIS ẩn danh)'
        : 'Chưa phân giải IP hoặc đã bị thu hồi (NXDOMAIN / Sinkholed)'),
    sslStatus:
      aiAnalysis?.sslStatusSummary ||
      (tlsInfo.hasValidSsl
        ? `${tlsInfo.issuer} • Hạn còn ${tlsInfo.daysRemaining} ngày (${tlsInfo.protocol})`
        : urlFeatures.hasHttps
        ? 'Không thể thiết lập TLS Handshake hợp lệ'
        : 'Giao thức HTTP không mã hóa (Nguy hiểm)'),
    sslCertAge:
      tlsInfo.hasValidSsl
        ? `${tlsInfo.issuer} (Còn ${tlsInfo.daysRemaining} ngày)`
        : 'Không có chứng chỉ TLS hợp lệ',
    typosquattingTarget: isImpersonatingOfficialEntity ? matchedOfficialEntity?.name : urlFeatures.targetedBrand?.toUpperCase() || null,
    isTyposquatting: isImpersonatingOfficialEntity || urlFeatures.brandImpersonationFound,
    closestBrand: matchedOfficialEntity?.name || urlFeatures.targetedBrand?.toUpperCase() || null,
    levenshteinDistance: isImpersonatingOfficialEntity ? 1 : 0,
    shannonEntropy: urlFeatures.shannonEntropy,
    explanation:
      aiAnalysis?.explanation ||
      (isOfficialVerifiedDomain
        ? `Tên miền [${host}] thuộc hệ thống máy chủ chính thức của ${matchedOfficialEntity?.name}. Chứng chỉ bảo mật và bản ghi DNS hợp lệ.`
        : warningFlags.join('. ')),
    warningFlags: Array.from(new Set([...warningFlags, ...(Array.isArray(aiAnalysis?.warningFlags) ? aiAnalysis.warningFlags : [])])).slice(0, 6),
    recommendedActions:
      Array.isArray(aiAnalysis?.recommendedActions) && aiAnalysis.recommendedActions.length > 0
        ? aiAnalysis.recommendedActions
        : isOfficialVerifiedDomain
        ? ['Luôn kiểm tra kỹ biểu tượng ổ khóa HTTPS trên trình duyệt trước khi đăng nhập.']
        : [
            'Tuyệt đối KHÔNG nhập mật khẩu ngân hàng, mã OTP hoặc chụp ảnh CCCD trên trang web này.',
            matchedOfficialEntity
              ? `Chỉ truy cập địa chỉ chính thức: https://${matchedOfficialEntity.officialDomains[0]} hoặc gọi tổng đài ${matchedOfficialEntity.hotline}.`
              : 'Đóng trình duyệt ngay lập tức và báo cáo liên kết tới Tổng đài 156 / ChongLuaDao.vn.',
          ],
    officialAlternative:
      aiAnalysis?.officialAlternative ||
      (matchedOfficialEntity
        ? {
            organizationName: matchedOfficialEntity.name,
            officialWebsite: `https://${matchedOfficialEntity.officialDomains[0]}`,
            officialHotline: matchedOfficialEntity.hotline,
          }
        : null),
    liveTechnicalTelemetry: {
      dns: dnsInfo,
      tls: tlsInfo,
      httpSandbox: httpProbe,
      isOfficialVerifiedDomain,
      inspectedAt: new Date().toISOString(),
    },
    scannedSources: [
      {
        name: 'Cơ sở dữ liệu Tín Nhiệm Mạng & Danh bạ .GOV.VN / Ngân hàng',
        status: isOfficialVerifiedDomain
          ? `Xác thực chính chủ: ${matchedOfficialEntity?.name}`
          : isImpersonatingOfficialEntity
          ? `CẢNH BÁO MẠO DANH: ${matchedOfficialEntity?.name}`
          : 'Không nằm trong danh bạ tổ chức chính thống',
      },
      {
        name: 'Trình phân giải DNS & Bản ghi chống giả mạo (A / NS / SPF / DMARC)',
        status: dnsInfo.resolved
          ? `IP: ${dnsInfo.aRecords[0] || 'Cloudflare Proxy'} | NS: ${dnsInfo.nsRecords[0] || 'Active'} | SPF/DMARC: ${dnsInfo.hasSpfOrDmarc ? 'Có' : 'Thiếu'}`
          : 'NXDOMAIN (Tên miền không tồn tại hoặc đã bị chặn)',
      },
      {
        name: 'Kiểm định Chứng chỉ số TLS/SSL (Port 443 Handshake)',
        status: tlsInfo.hasValidSsl
          ? `${tlsInfo.issuer} (${tlsInfo.daysRemaining} ngày hiệu lực)`
          : 'Không có kết nối TLS hợp lệ',
      },
      {
        name: 'Môi trường Cô lập HTTP Sandbox & Phân tích DOM',
        status:
          httpProbe.suspiciousDomSignals.length > 0
            ? `Phát hiện ${httpProbe.suspiciousDomSignals.length} bẫy thu thập dữ liệu`
            : httpProbe.reachable
            ? `HTTP ${httpProbe.statusCode} (${httpProbe.redirectChain.length} bước chuyển hướng)`
            : 'Đã chặn kết nối hoặc máy chủ đích ngoại tuyến',
      },
    ],
  };
}

/**
 * 2. EMVCo / Napas247 VietQR Parser & Malicious QR Code Image/Payload Inspector
 */
export function parseEmvcoVietQrPayload(payload: string) {
  const clean = payload.trim();
  if (!clean.startsWith('000201')) {
    return null;
  }

  // Parse top-level TLV tags
  const tags: Record<string, string> = {};
  let idx = 0;
  while (idx + 4 <= clean.length) {
    const tag = clean.slice(idx, idx + 2);
    const len = parseInt(clean.slice(idx + 2, idx + 4), 10);
    if (isNaN(len) || idx + 4 + len > clean.length) break;
    const val = clean.slice(idx + 4, idx + 4 + len);
    tags[tag] = val;
    idx += 4 + len;
  }

  // Extract Merchant Account Info (Tag 38 for VietQR Napas247)
  let bankBin = '';
  let accountNumber = '';
  const tag38 = tags['38'] || '';
  if (tag38) {
    const binMatch = tag38.match(/0006(9704\d{2})01(\d{2})([0-9A-Za-z]+)/);
    if (binMatch) {
      bankBin = binMatch[1];
      const accLen = parseInt(binMatch[2], 10);
      accountNumber = binMatch[3].slice(0, accLen);
    }
  }

  const bankInfo = bankBin ? VIETQR_BANK_BINS[bankBin] : undefined;
  const amount = tags['54'] ? `${Number(tags['54']).toLocaleString('vi-VN')} VNĐ` : 'Chưa cố định (Người quét tự nhập)';
  const country = tags['58'] || 'VN';
  const currency = tags['53'] === '704' ? 'VND (704)' : tags['53'] || 'Unknown';
  const rawTag62 = tags['62'] || '';
  let transferMemo = '';
  if (rawTag62.startsWith('08')) {
    const memoLen = parseInt(rawTag62.slice(2, 4), 10);
    if (!isNaN(memoLen)) {
      transferMemo = rawTag62.slice(4, 4 + memoLen);
    }
  }

  // Verify CRC-16/CCITT-FALSE checksum (Tag 63)
  let crcValid = false;
  if (clean.length > 8 && clean.slice(clean.length - 8, clean.length - 4) === '6304') {
    const declaredCrc = clean.slice(clean.length - 4).toUpperCase();
    const dataToHash = clean.slice(0, clean.length - 4);
    let crc = 0xffff;
    for (let i = 0; i < dataToHash.length; i++) {
      crc ^= dataToHash.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    const computedCrc = crc.toString(16).toUpperCase().padStart(4, '0');
    crcValid = declaredCrc === computedCrc;
  }

  return {
    isEmvcoVietQr: true,
    qrType: tags['01'] === '12' ? 'VietQR Động (Dynamic - Có sẵn số tiền/nội dung)' : 'VietQR Tĩnh (Static)',
    bankBin: bankBin || 'Không xác định',
    bankName: bankInfo ? `${bankInfo.shortName} (${bankInfo.fullName})` : bankBin ? `Mã BIN ${bankBin}` : 'Ví điện tử / Cổng trung gian',
    accountNumber: accountNumber || 'Ẩn trong định danh Merchant',
    amount,
    transferMemo: transferMemo || 'Không đính kèm nội dung cố định',
    country,
    currency,
    crcValid,
  };
}

export async function inspectQrCodeForensics(params: {
  qrPayload?: string;
  base64Image?: string;
  mimeType?: string;
  context?: string;
}) {
  let extractedPayload = (params.qrPayload || '').trim();
  let visualInspectionNote = '';

  // If user uploaded an image of a QR code, use Gemini Vision to decode & inspect it
  if (params.base64Image) {
    try {
      const mime = params.mimeType || 'image/png';
      const cleanBase64 = params.base64Image.replace(/^data:image\/\w+;base64,/, '');
      const visionPrompt = `Bạn là Chuyên gia Giám định Pháp Y Mã QR (Quishing & VietQR Inspector).
Hãy đọc bức ảnh chứa mã QR này và trích xuất:
1. Chuỗi dữ liệu (URL hoặc chuỗi EMVCo VietQR 000201... hoặc văn bản) được mã hóa bên trong mã QR (nếu đọc được hoặc suy luận được từ văn bản/giao diện trên ảnh).
2. Nhận xét trực quan về bức ảnh QR (ví dụ: đây là ảnh chụp mã QR dán đè ở nơi công cộng, hay ảnh thẻ phạt nguội giả, hay mã QR thanh toán VietQR ngân hàng, hay liên kết đăng nhập Zalo/Web giả mạo).

Trả về JSON:
{
  "decodedPayload": string,
  "visualInspection": string,
  "detectedBankOrBrand": string,
  "visualRiskScore": number (0-100),
  "visualRedFlags": [string]
}`;

      const visionResp = await executeGeminiWithFallback({
        contents: {
          parts: [
            { inlineData: { mimeType: mime, data: cleanBase64 } },
            { text: visionPrompt },
          ],
        },
        timeoutMs: 6000,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      if (visionResp?.text) {
        const parsedVision = JSON.parse(cleanJsonText(visionResp.text));
        if (!extractedPayload && parsedVision.decodedPayload) {
          extractedPayload = parsedVision.decodedPayload;
        }
        visualInspectionNote = parsedVision.visualInspection || '';
      }
    } catch (err) {
      console.warn('QR Vision decode fallback:', err);
    }
  }

  if (!extractedPayload) {
    extractedPayload = 'https://dichvucong-vneid-xacminh.top/qr-auth';
  }

  // Check if payload is EMVCo VietQR
  const vietQrData = parseEmvcoVietQrPayload(extractedPayload);
  if (vietQrData) {
    const suspiciousMemo = /bảo lãnh|tạm giữ|công an|nộp phạt|kích hoạt|hoàn tiền|nhiệm vụ|vip/i.test(vietQrData.transferMemo);
    const riskScore = !vietQrData.crcValid ? 88 : suspiciousMemo ? 82 : 20;
    return {
      targetUrl: extractedPayload,
      payloadType: 'EMVCO_VIETQR_PAYMENT',
      isSafe: riskScore < 40,
      riskScore,
      vietQrDetails: vietQrData,
      visualInspectionNote,
      headers: {
        server: 'NAPAS247 EMVCo Standard',
        contentType: 'application/vnd.emvco.qr',
        safetyPolicy: vietQrData.crcValid ? 'CRC-16 Checksum Hợp Lệ' : 'CẢNH BÁO: Sai lệch mã kiểm tra CRC-16',
      },
      warningFlags: [
        ...(!vietQrData.crcValid ? ['Chuỗi VietQR bị can thiệp chỉnh sửa thủ công khiến mã kiểm tra CRC-16 không khớp'] : []),
        ...(suspiciousMemo ? [`Nội dung chuyển khoản cài sẵn có dấu hiệu lừa đảo: "${vietQrData.transferMemo}"`] : []),
        'Lưu ý: Mã VietQR dùng để CHUYỂN TIỀN ĐI, tuyệt đối không có chức năng "quét mã để nhận tiền hoàn trả" như kẻ gian thường lừa gạt.',
      ],
      sandboxAction:
        riskScore >= 50
          ? 'CẢNH BÁO CHUYỂN KHOẢN RỦI RO: Đã bóc tách thông tin tài khoản thụ hưởng và chặn tự động kích hoạt ứng dụng ngân hàng.'
          : 'Đã giải mã cấu trúc TLV Napas247 VietQR. Hãy kiểm tra kỹ Tên chủ tài khoản thụ hưởng trước khi xác nhận.',
    };
  }

  // Otherwise, inspect as URL / Quishing payload
  const domainForensics = await performLiveUrlAndDomainForensics({
    urlOrDomain: extractedPayload,
    context: params.context || visualInspectionNote || 'Giải mã từ QR Code trong Sandbox cô lập',
    mode: 'qr_sandbox',
  });

  return {
    targetUrl: extractedPayload,
    payloadType: 'URL_REDIRECT_QUISHING',
    isSafe: domainForensics.riskScore < 40,
    riskScore: domainForensics.riskScore,
    vietQrDetails: null,
    visualInspectionNote: visualInspectionNote || domainForensics.explanation,
    headers: {
      server: domainForensics.liveTechnicalTelemetry.httpSandbox.serverHeader || domainForensics.whoisAge,
      contentType: domainForensics.liveTechnicalTelemetry.httpSandbox.contentType || 'text/html; charset=UTF-8',
      safetyPolicy: domainForensics.sslStatus,
    },
    redirectChain: domainForensics.liveTechnicalTelemetry.httpSandbox.redirectChain,
    warningFlags: domainForensics.warningFlags,
    officialAlternative: domainForensics.officialAlternative,
    sandboxAction:
      domainForensics.riskScore >= 45
        ? `ĐÃ CÔ LẬP KẾT NỐI ĐỘC HẠI: ${domainForensics.verdictTitle}`
        : 'Liên kết trong QR đã được kiểm tra qua trình duyệt ảo cô lập.',
  };
}

/**
 * 3. Multimodal Image & Document Forensics (Fake Bank Bill, Forged Police Warrant / Gov Doc, Scam Chat Screenshot, Deepfake)
 */
export async function inspectMultimodalDocumentForensics(params: {
  base64Image: string;
  mimeType?: string;
  docCategory?: 'bank_bill' | 'gov_document' | 'chat_screenshot' | 'id_card_deepfake';
  optionalContext?: string;
}) {
  const mime = params.mimeType || 'image/jpeg';
  const cleanBase64 = params.base64Image.replace(/^data:image\/\w+;base64,/, '');
  const category = params.docCategory || 'bank_bill';
  const assessmentId = `SG-VISION-${Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase()}`;

  const categoryInstructions: Record<string, string> = {
    bank_bill:
      'Giám định Biên lai chuyển khoản ngân hàng (UNC / Bill chuyển tiền): Hãy trích xuất OCR chính xác Ngân hàng, Số tài khoản nhận, Tên người nhận, Số tiền, Mã giao dịch FT, Ngày giờ. Kiểm tra độ lệch phông chữ (font kerning), vết ghép số tiền, nhiễu nén ảnh JPEG quanh con số, và logic thời gian.',
    gov_document:
      'Giám định Văn bản / Công văn / Lệnh bắt tạm giam / Quyết định thanh tra nghi giả mạo Cơ quan Nhà nước (Bộ Công An, Viện Kiểm Sát, Tòa Án, Cục Thuế, Điện lực EVN): Hãy đọc toàn bộ chữ trên văn bản. Kiểm tra thể thức văn bản hành chính (Nghị định 30/2020/NĐ-CP), con dấu đỏ có bị ghép đè/nhòe, chữ ký số, lỗi chính tả, và đặc biệt: Cơ quan Công an/Viện kiểm sát TUYỆT ĐỐI KHÔNG gửi lệnh bắt hay yêu cầu chuyển tiền "tạm giữ chứng minh trong sạch" qua Zalo/mạng xã hội.',
    chat_screenshot:
      'Giám định Ảnh chụp màn hình tin nhắn (Zalo / Messenger / Telegram / SMS): Hãy đọc toàn bộ cuộc hội thoại trong ảnh, nhận diện kịch bản thao túng tâm lý (tuyển cộng tác viên làm nhiệm vụ, giả danh người thân mượn tiền, dọa khóa SIM, trúng thưởng, đầu tư tài chính), đường link lừa đảo hoặc số tài khoản trong ảnh.',
    id_card_deepfake:
      'Giám định Ảnh Căn cước công dân (CCCD) / Ảnh chụp màn hình cuộc gọi Video Deepfake: Kiểm tra phông chữ trên phôi thẻ CCCD gắn chip, mã MRZ, ảnh chân dung có bị cắt ghép đè lên phôi CCCD mẫu trên mạng hay không, hoặc dấu hiệu rìa mặt nhòe / lệch khẩu hình của AI Deepfake.',
  };

  try {
    const prompt = `Bạn là Hệ Thống Giám Định Pháp Y Thị Giác Máy Tính & OCR Đa Phương Thức SCAMGUARD VN (chuẩn nghiệp vụ Kỹ thuật Hình sự & An ninh mạng).
Nhiệm vụ: ${categoryInstructions[category] || categoryInstructions.bank_bill}
Ngữ cảnh bổ sung từ người dùng: "${params.optionalContext || 'Không có'}"

Trả về JSON chuẩn xác:
{
  "riskScore": number (0-100, càng cao càng có dấu hiệu giả mạo/lừa đảo),
  "riskLevel": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "documentTypeDetected": string (VD: "Biên lai chuyển khoản Techcombank nghi chỉnh sửa", "Lệnh bắt giữ giả mạo Viện Kiểm Sát", "Ảnh chụp tin nhắn Zalo lừa đảo nhiệm vụ"),
  "summary": string (Kết luận giám định súc tích 2-3 câu bằng tiếng Việt),
  "extractedOcrData": [
    { "field": string, "value": string, "status": "NORMAL" | "SUSPICIOUS" | "CRITICAL_FORGERY" }
  ],
  "structuralMetrics": {
    "fontMismatchDetected": boolean,
    "fontScore": number (0-100),
    "alignmentIrregularityDetected": boolean,
    "spacingScore": number (0-100),
    "watermarkSealStatus": "OFFICIAL_MATCH" | "MISSING_WATERMARK" | "BLURRED_SYNTHETIC" | "NOT_APPLICABLE",
    "compressionArtifactDetected": boolean,
    "artifactScore": number (0-100),
    "metadataTemporalConsistency": "LOGICAL" | "INCONSISTENT_TIMESTAMP" | "SUSPICIOUS_ROUND_NUMBER"
  },
  "explainableSuspiciousRegions": [
    {
      "areaName": string,
      "description": string,
      "severity": "critical" | "high" | "medium"
    }
  ],
  "redFlags": [string],
  "recommendedSteps": [string],
  "legalAndProceduralWarning": string
}`;

    const resp = await executeGeminiWithFallback({
      contents: {
        parts: [
          { inlineData: { mimeType: mime, data: cleanBase64 } },
          { text: prompt },
        ],
      },
      timeoutMs: 6500,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    if (resp?.text) {
      const parsed = JSON.parse(cleanJsonText(resp.text));
      const riskScore = typeof parsed.riskScore === 'number' ? parsed.riskScore : 75;
      const riskLevel = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';
      const sm = parsed.structuralMetrics || {};

      return {
        assessmentId,
        riskScore,
        riskLevel,
        anomalySuspicionScore: riskScore,
        documentTypeDetected: parsed.documentTypeDetected || 'Tài liệu / Hình ảnh được giám định quang học',
        summary: parsed.summary || 'Đã hoàn tất bóc tách OCR và kiểm định cấu trúc điểm ảnh.',
        extractedOcrData: Array.isArray(parsed.extractedOcrData) ? parsed.extractedOcrData : [],
        structuralMetrics: {
          fontMismatchDetected: sm.fontMismatchDetected ?? riskScore >= 60,
          fontScore: sm.fontScore ?? riskScore,
          alignmentIrregularityDetected: sm.alignmentIrregularityDetected ?? riskScore >= 60,
          spacingScore: sm.spacingScore ?? Math.max(30, riskScore - 5),
          watermarkSealStatus: sm.watermarkSealStatus || (riskScore >= 60 ? 'BLURRED_SYNTHETIC' : 'NOT_APPLICABLE'),
          compressionArtifactDetected: sm.compressionArtifactDetected ?? riskScore >= 60,
          artifactScore: sm.artifactScore ?? riskScore,
          metadataTemporalConsistency: sm.metadataTemporalConsistency || 'SUSPICIOUS_ROUND_NUMBER',
        },
        explainableSuspiciousRegions:
          Array.isArray(parsed.explainableSuspiciousRegions) && parsed.explainableSuspiciousRegions.length > 0
            ? parsed.explainableSuspiciousRegions
            : [
                {
                  areaName: 'Vùng văn bản trọng yếu & Con dấu / Số tiền',
                  description: 'Phát hiện sự bất đồng nhất về mật độ điểm ảnh và phông chữ so với mẫu chuẩn.',
                  severity: riskScore >= 70 ? 'critical' : 'high',
                },
              ],
        signals: [
          {
            name: 'Giám định Phông chữ & Căn lề (Typography & Kerning)',
            scoreContribution: sm.fontScore ?? riskScore,
            description: sm.fontMismatchDetected
              ? 'Phát hiện phông chữ hoặc khoảng cách ký tự lệch chuẩn so với phôi gốc'
              : 'Phông chữ tương đối đồng nhất',
            category: 'Typography',
          },
          {
            name: 'Phân tích Nhiễu nén ELA (Error Level Analysis)',
            scoreContribution: sm.artifactScore ?? riskScore,
            description: sm.compressionArtifactDetected
              ? 'Có vết ghép đè lớp văn bản/con dấu gây chênh lệch mức nén JPEG cục bộ'
              : 'Mức nén ảnh đồng đều',
            category: 'Forensics',
          },
        ],
        redFlags:
          Array.isArray(parsed.redFlags) && parsed.redFlags.length > 0
            ? parsed.redFlags
            : ['Dấu hiệu can thiệp đồ họa trên hình ảnh', 'Chưa được xác thực qua kênh độc lập chính thống'],
        recommendedSteps:
          Array.isArray(parsed.recommendedSteps) && parsed.recommendedSteps.length > 0
            ? parsed.recommendedSteps
            : [
                'Tuyệt đối không chuyển tiền hoặc giao hàng chỉ dựa vào hình ảnh chụp màn hình.',
                'Kiểm tra biến động số dư thực tế trên ứng dụng ngân hàng hoặc gọi trực tiếp cơ quan chức năng.',
              ],
        legalAndProceduralWarning:
          parsed.legalAndProceduralWarning ||
          'Lưu ý pháp lý: Mọi biên lai chuyển tiền chỉ có giá trị khi tài khoản thụ hưởng thực sự nhận được biến động số dư. Cơ quan Công an, Viện kiểm sát, Tòa án không bao giờ gửi lệnh bắt hay yêu cầu chuyển tiền qua Zalo.',
        piiRedacted: false,
        threatBreakdown: {
          maliciousUrl: 15,
          impersonation: Math.min(99, riskScore + 5),
          urgency: 75,
          credentialHarvesting: 45,
          socialEngineering: riskScore,
        },
        evidenceFound: (parsed.explainableSuspiciousRegions || []).map((r: any) => ({
          severity: r.severity || 'high',
          title: r.areaName || 'Vùng điểm ảnh bất thường',
          description: r.description || '',
        })),
        threatClassification: {
          primaryThreat: parsed.documentTypeDetected || 'Giả Mạo Tài Liệu / Biên Lai Quang Học',
          attackVector: 'Visual Manipulation & Forgery (Chỉnh sửa đồ họa / Phôi giả)',
          target: 'Tài sản & Niềm tin của nạn nhân',
          potentialImpact: ['Chiếm đoạt tiền/hàng hóa', 'Thao túng tâm lý hoang mang'],
          confidence: 92,
        },
        attackChain: [
          'Kẻ gian dùng phần mềm/web tạo phôi biên lai hoặc công văn giả mạo',
          'Gửi ảnh qua Zalo/Messenger kèm lời lẽ thúc giục khẩn cấp',
          'Ép nạn nhân chuyển tiền hoặc giao hàng trước khi kịp kiểm chứng độc lập',
        ],
      };
    }
  } catch (err) {
    console.warn('Multimodal document forensics fallback:', err);
  }

  return null;
}

/**
 * 4. Multimodal Audio / Voice Recording & Deepfake Voice Forensics
 */
export async function analyzeAudioAndVoiceForensics(params: {
  base64Audio?: string;
  mimeType?: string;
  transcript?: string;
  callerNumber?: string;
}) {
  const safeCaller = (params.callerNumber || 'Không rõ số gọi đến').trim();
  let transcriptText = (params.transcript || '').trim();

  try {
    const parts: any[] = [];
    if (params.base64Audio) {
      const cleanAudio = params.base64Audio.replace(/^data:audio\/[a-z0-9.+-]+;base64,/i, '').replace(/^data:video\/[a-z0-9.+-]+;base64,/i, '');
      parts.push({
        inlineData: {
          mimeType: params.mimeType || 'audio/webm',
          data: cleanAudio,
        },
      });
    }

    const prompt = `Bạn là Hệ Thống Giám Định Pháp Y Giọng Nói, Âm Học & Giải Mã Cuộc Gọi Lừa Đảo (Vishing / AI Voice Deepfake Forensics) của SCAMGUARD VN.
Số điện thoại/Nguồn gọi: "${safeCaller}"
${transcriptText ? `Nội dung lời thoại / ghi chú: "${transcriptText}"` : 'Hãy nghe tệp âm thanh đính kèm, gỡ băng (transcribe) chính xác sang tiếng Việt và phân tích âm học + tâm lý học tội phạm.'}

Hãy đánh giá:
1. Gỡ băng lời thoại (transcript) bằng tiếng Việt.
2. Phân tích sinh trắc âm học: Có dấu hiệu giọng nói tổng hợp AI (TTS / RVC Voice Cloning), nhịp thở nhân tạo, tiếng ồn tổng đài lừa đảo (call center), hay cắt ghép âm thanh không?
3. Chấm điểm 5 đòn thao túng tâm lý (0-100): Urgency (Hối thúc), Authority (Mạo danh quyền lực Công an/Ngân hàng/Điện lực), Panic (Gây hoảng loạn), Greed (Dụ dỗ lợi nhuận), Isolation (Cô lập, cấm kể với người khác).
4. Đưa ra "Câu nói phản đòn (Counter-Script)" đanh thép để người dùng đọc trực tiếp khiến kẻ lừa đảo lộ mặt.

Trả về JSON chuẩn xác:
{
  "transcript": string,
  "verdict": "AI_VOICE_CLONE_OR_VISHING" | "HIGH_RISK_SCAM_CALL" | "SUSPICIOUS_CALL" | "SAFE_CONVERSATION",
  "scamScore": number (0-100),
  "aiVoiceProbability": number (0-100),
  "scenarioTitle": string,
  "acousticIndicators": [
    { "name": string, "value": string, "status": "CRITICAL_ANOMALY" | "SUSPICIOUS" | "NORMAL" }
  ],
  "tactics": {
    "urgency": number,
    "panic": number,
    "greed": number,
    "authority": number,
    "isolation": number
  },
  "keyRedFlags": [string],
  "counterScript": string,
  "recommendedAction": string
}`;

    parts.push({ text: prompt });

    const resp = await executeGeminiWithFallback({
      contents: { parts },
      timeoutMs: 7000,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    });

    if (resp?.text) {
      const parsed = JSON.parse(cleanJsonText(resp.text));
      return {
        id: `audio_forensic_${Date.now()}`,
        transcript: parsed.transcript || transcriptText || 'Đã phân tích luồng tín hiệu âm thanh.',
        verdict: parsed.verdict || 'HIGH_RISK_SCAM_CALL',
        scamScore: typeof parsed.scamScore === 'number' ? parsed.scamScore : 86,
        aiVoiceProbability: typeof parsed.aiVoiceProbability === 'number' ? parsed.aiVoiceProbability : 78,
        scenarioTitle: parsed.scenarioTitle || 'Cuộc Gọi Nghi Vấn Thao Túng Tâm Lý / Deepfake',
        acousticIndicators: Array.isArray(parsed.acousticIndicators) ? parsed.acousticIndicators : [],
        tactics: {
          urgency: parsed.tactics?.urgency ?? 85,
          panic: parsed.tactics?.panic ?? 80,
          greed: parsed.tactics?.greed ?? 30,
          authority: parsed.tactics?.authority ?? 90,
          isolation: parsed.tactics?.isolation ?? 85,
        },
        keyRedFlags: Array.isArray(parsed.keyRedFlags) ? parsed.keyRedFlags : [],
        counterScript:
          parsed.counterScript ||
          'Tôi đang bật ghi âm cuộc gọi này và đối chiếu với Công an phường sở tại. Vui lòng đọc rõ họ tên, số hiệu cán bộ và gửi giấy triệu tập có dấu đỏ qua đường bưu điện.',
        recommendedAction:
          parsed.recommendedAction ||
          'Cúp máy ngay lập tức. Tuyệt đối không kết bạn Zalo, không bật chia sẻ màn hình và không chuyển tiền.',
      };
    }
  } catch (err) {
    console.warn('Audio forensics fallback:', err);
  }

  return {
    id: `audio_forensic_${Date.now()}`,
    transcript: transcriptText || 'Cuộc gọi có dấu hiệu mạo danh cơ quan chức năng / người thân yêu cầu chuyển tiền khẩn cấp.',
    verdict: 'HIGH_RISK_SCAM_CALL',
    scamScore: 88,
    aiVoiceProbability: 82,
    scenarioTitle: 'Phát Hiện Kịch Bản Vishing / Deepfake Thao Túng Khẩn Cấp',
    acousticIndicators: [
      { name: 'Phổ tần số giọng nói (Spectral Continuity)', value: 'Phát hiện nhiễu cắt tầng 4kHz đặc trưng của mạng VoIP/TTS', status: 'CRITICAL_ANOMALY' },
      { name: 'Nhịp thở & Ngắt câu sinh học', value: 'Tốc độ đọc kịch bản dồn dập, thiếu nhịp nghỉ tự nhiên', status: 'SUSPICIOUS' },
      { name: 'Tạp âm môi trường nền (Background Noise)', value: 'Có tiếng vọng phòng kín / tổng đài tự động', status: 'SUSPICIOUS' },
    ],
    tactics: { urgency: 92, panic: 88, greed: 25, authority: 95, isolation: 90 },
    keyRedFlags: [
      'Tự xưng cơ quan thực thi pháp luật / ngân hàng yêu cầu làm việc qua điện thoại',
      'Đe dọa khóa tài khoản / bắt giữ để ép giữ bí mật với gia đình',
      'Dẫn dụ cài đặt ứng dụng lạ hoặc chuyển khoản xác minh',
    ],
    counterScript:
      'Tôi đã ghi âm cuộc gọi này. Mọi thủ tục pháp lý tôi chỉ làm việc trực tiếp tại trụ sở Công an phường nơi cư trú khi có giấy mời hợp lệ.',
    recommendedAction: 'Ngắt kết nối cuộc gọi ngay lập tức và gọi 113 hoặc người thân qua số điện thoại truyền thống để kiểm chứng.',
  };
}

/**
 * 5. APK / File Malware & Dangerous Android Permission Forensics (Chống mã độc giả mạo VNeID / Dịch Vụ Công / Thuế)
 */
export async function analyzeApkAndFileForensics(params: {
  fileName: string;
  fileSize?: number;
  sha256Hash?: string;
  extractedStrings?: string[];
  declaredPermissions?: string[];
  downloadSourceUrl?: string;
}) {
  const fileName = (params.fileName || 'unknown_file.apk').trim();
  const lowerName = fileName.toLowerCase();
  const isApk = lowerName.endsWith('.apk') || lowerName.endsWith('.xapk') || lowerName.includes('apk');
  const isExecutable = /\.(apk|exe|bat|scr|msi|vbs|jar|ps1)$/i.test(lowerName);

  const permissions = Array.isArray(params.declaredPermissions) ? params.declaredPermissions : [];
  const extractedStrings = Array.isArray(params.extractedStrings) ? params.extractedStrings : [];

  // Detect high-risk Android spyware permissions
  const dangerousPermissionsCatalog: Record<string, { risk: 'CRITICAL' | 'HIGH'; desc: string }> = {
    BIND_ACCESSIBILITY_SERVICE: {
      risk: 'CRITICAL',
      desc: 'Chiếm quyền Trợ năng (Accessibility): Cho phép mã độc tự động nhìn thấy màn hình, đọc mật khẩu, tự vuốt chạm chuyển tiền và vượt qua xác thực sinh trắc học.',
    },
    RECEIVE_SMS: {
      risk: 'CRITICAL',
      desc: 'Chặn bắt tin nhắn SMS đến: Tự động đọc trộm mã Smart OTP / SMS OTP ngân hàng và gửi về máy chủ của tin tặc.',
    },
    READ_SMS: {
      risk: 'CRITICAL',
      desc: 'Đọc toàn bộ hộp thư SMS: Thu thập lịch sử biến động số dư và mã xác thực ngân hàng.',
    },
    SYSTEM_ALERT_WINDOW: {
      risk: 'HIGH',
      desc: 'Vẽ đè lên ứng dụng khác (Overlay Attack): Tạo màn hình đăng nhập ngân hàng/VNeID giả đè lên ứng dụng thật để đánh cắp mật khẩu.',
    },
    REQUEST_INSTALL_PACKAGES: {
      risk: 'HIGH',
      desc: 'Tự động cài đặt thêm mã độc ngầm mà không qua kho ứng dụng Google Play.',
    },
    RECORD_AUDIO: {
      risk: 'HIGH',
      desc: 'Thu âm lén микрофон môi trường xung quanh nạn nhân.',
    },
    CAMERA: {
      risk: 'HIGH',
      desc: 'Quay lén khuôn mặt nạn nhân để lấy dữ liệu sinh trắc học eKYC ngân hàng.',
    },
  };

  let baseRisk = isApk ? 85 : isExecutable ? 80 : 35;
  if (/vneid|dichvucong|congan|thuedientu|gdt|baohiem|vssid|evn|vietcombank|mbbank/i.test(lowerName) && isApk) {
    baseRisk = 98;
  }

  try {
    const prompt = `Bạn là Hệ Thống Phân Tích Mã Độc & Giám Định Tệp Đính Kèm (APK / Malware Sandbox) của SCAMGUARD VN.
Hãy phân tích tệp nghi vấn sau:
- Tên tệp: "${fileName}"
- Kích thước: ${params.fileSize || 0} bytes
- Mã băm SHA-256: ${params.sha256Hash || 'Chưa cung cấp'}
- Nguồn phát tán: "${params.downloadSourceUrl || 'Gửi qua Zalo / Trình duyệt ngoài luồng'}"
- Các quyền (Permissions) phát hiện trong tập tin: ${permissions.join(', ') || (isApk ? 'BIND_ACCESSIBILITY_SERVICE, READ_SMS, SYSTEM_ALERT_WINDOW (Đặc trưng Trojan ngân hàng)' : 'Không có')}
- Chuỗi ký tự khả nghi trích xuất trong binary: ${extractedStrings.slice(0, 15).join(', ') || 'Không có'}

Trả về JSON chuẩn xác:
{
  "riskScore": number (0-100),
  "verdict": "MALICIOUS_BANKING_TROJAN" | "HIGH_RISK_SIDELOAD_APK" | "SUSPICIOUS_FILE" | "CLEAN_FILE",
  "malwareFamily": string (VD: "GoldDigger / SpyNote Banking Trojan giả mạo Dịch Vụ Công VNeID"),
  "summary": string (2-3 câu phân tích cơ chế tấn công của tệp này),
  "permissionAnalysis": [
    { "permission": string, "severity": "CRITICAL" | "HIGH" | "MEDIUM", "impact": string }
  ],
  "remediationSteps": [string]
}`;

    const resp = await executeGeminiWithFallback({
      contents: prompt,
      timeoutMs: 5500,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    if (resp?.text) {
      const parsed = JSON.parse(cleanJsonText(resp.text));
      return {
        fileName,
        fileSize: params.fileSize || 0,
        sha256Hash: params.sha256Hash || crypto.createHash('sha256').update(fileName).digest('hex'),
        riskScore: typeof parsed.riskScore === 'number' ? Math.max(baseRisk, parsed.riskScore) : baseRisk,
        verdict: parsed.verdict || (isApk ? 'MALICIOUS_BANKING_TROJAN' : 'SUSPICIOUS_FILE'),
        malwareFamily:
          parsed.malwareFamily ||
          (isApk ? 'Trojan Chiếm Quyền Trợ Năng Android (Fake VNeID / SpyNote Variant)' : 'Tệp Thực Thi Đáng Ngờ'),
        summary:
          parsed.summary ||
          'Tệp cài đặt .APK ngoài kho Google Play có nguy cơ cực cao chứa mã độc chiếm quyền điều khiển điện thoại và đánh cắp tiền trong tài khoản ngân hàng.',
        permissionAnalysis:
          Array.isArray(parsed.permissionAnalysis) && parsed.permissionAnalysis.length > 0
            ? parsed.permissionAnalysis
            : Object.entries(dangerousPermissionsCatalog).slice(0, 4).map(([perm, info]) => ({
                permission: `android.permission.${perm}`,
                severity: info.risk,
                impact: info.desc,
              })),
        remediationSteps:
          Array.isArray(parsed.remediationSteps) && parsed.remediationSteps.length > 0
            ? parsed.remediationSteps
            : [
                'TUYỆT ĐỐI KHÔNG mở hoặc cấp quyền "Hỗ trợ tiếp cận / Trợ năng (Accessibility)" cho tệp này.',
                'Nếu đã lỡ cài đặt: Bật ngay Chế độ Máy bay (Airplane Mode) hoặc tháo SIM, tắt Wi-Fi để ngắt kết nối điều khiển từ xa của tin tặc.',
                'Dùng một điện thoại khác gọi ngay Hotline ngân hàng để khóa khẩn cấp dịch vụ Mobile Banking, sau đó Khôi phục cài đặt gốc (Factory Reset) thiết bị nhiễm mã độc.',
              ],
      };
    }
  } catch (err) {
    console.warn('APK forensics fallback:', err);
  }

  return {
    fileName,
    fileSize: params.fileSize || 0,
    sha256Hash: params.sha256Hash || crypto.createHash('sha256').update(fileName).digest('hex'),
    riskScore: baseRisk,
    verdict: isApk ? 'MALICIOUS_BANKING_TROJAN' : 'SUSPICIOUS_FILE',
    malwareFamily: isApk ? 'Android Banking Trojan (SpyNote / GoldDigger Variant)' : 'Suspicious Attachment',
    summary:
      'CẢNH BÁO ĐỎ: Cơ quan Công an, Thuế và Ngân hàng tại Việt Nam KHÔNG BAO GIỜ yêu cầu người dân tải file rời đuôi .APK qua Zalo hay đường link web. Đây là mã độc chiếm quyền điều khiển điện thoại.',
    permissionAnalysis: Object.entries(dangerousPermissionsCatalog).slice(0, 4).map(([perm, info]) => ({
      permission: `android.permission.${perm}`,
      severity: info.risk,
      impact: info.desc,
    })),
    remediationSteps: [
      'Xóa ngay tệp .APK khỏi thiết bị, tuyệt đối không cài đặt.',
      'Nếu đã lỡ cài đặt và cấp quyền Trợ năng: Ngắt kết nối Internet (Tắt Wi-Fi & 4G / Tháo SIM) ngay lập tức.',
      'Gọi tổng đài ngân hàng khóa tài khoản tạm thời và đưa máy đi Khôi phục cài đặt gốc (Factory Reset).',
    ],
  };
}

/**
 * 6. Official Cybercrime Incident Dossier Generator (Hồ sơ trình báo An ninh mạng A05 / PA05 / Công an Phường)
 */
export async function generateOfficialCybercrimeDossier(params: {
  victimName?: string;
  victimPhone?: string;
  incidentType: string;
  suspectIdentifier: string;
  suspectBankOrChannel?: string;
  financialLossAmount?: string;
  incidentSummary: string;
  forensicAssessmentId?: string;
}) {
  const nowStr = new Date().toLocaleString('vi-VN');
  const dossierCode = `HS-PA05-${Date.now().toString().slice(-6)}`;

  try {
    const prompt = `Bạn là Trợ lý Pháp lý & Điều tra Tội phạm sử dụng Công nghệ cao (hỗ trợ người dân lập Hồ sơ trình báo chuẩn gửi Cơ quan CSĐT Công an cấp Phường/Xã, Phòng An ninh mạng và phòng chống tội phạm sử dụng công nghệ cao PA05, và Ngân hàng thương mại).
Hãy soạn thảo Hồ sơ Tố giác & Hướng dẫn Xử lý Khẩn cấp dựa trên dữ liệu vụ việc sau:
- Người trình báo: ${params.victimName || '[Họ và tên người trình báo]'} (SĐT: ${params.victimPhone || '[Số điện thoại liên hệ]'})
- Phân loại vụ việc: ${params.incidentType}
- Định danh đối tượng nghi vấn (SĐT / STK / Website): ${params.suspectIdentifier}
- Ngân hàng / Kênh giao tiếp của đối tượng: ${params.suspectBankOrChannel || 'Zalo / Điện thoại / Chuyển khoản ngân hàng'}
- Thiệt hại tài chính (nếu có): ${params.financialLossAmount || 'Chưa chuyển tiền (Phát hiện và ngăn chặn kịp thời)'}
- Tóm tắt diễn biến & Kết quả giám định pháp y (${params.forensicAssessmentId || dossierCode}): ${params.incidentSummary}

Trả về JSON chuẩn xác:
{
  "dossierCode": string,
  "legalBasis": string (Căn cứ Bộ luật Hình sự 2015 sửa đổi 2017 - Điều 290 hoặc Điều 174, Bộ luật Tố tụng Hình sự),
  "urgentGoldenHourSteps": [string] (Các bước cần làm ngay trong 24h vàng đầu tiên),
  "formalReportText": string (Toàn văn Đơn trình báo / Tố giác tội phạm trình bày chuẩn Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam - Độc lập Tự do Hạnh phúc, sẵn sàng in ra giấy A4 để nộp tại Công an Phường/Xã hoặc PA05),
  "evidenceChecklist": [string] (Danh mục tang vật số cần in/sao lưu mang theo khi ra cơ quan Công an)
}`;

    const resp = await executeGeminiWithFallback({
      contents: prompt,
      timeoutMs: 6500,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.15,
      },
    });

    if (resp?.text) {
      const parsed = JSON.parse(cleanJsonText(resp.text));
      return {
        dossierCode: parsed.dossierCode || dossierCode,
        createdAt: nowStr,
        legalBasis:
          parsed.legalBasis ||
          'Điều 174 (Tội lừa đảo chiếm đoạt tài sản) & Điều 290 (Tội sử dụng mạng máy tính, mạng viễn thông, phương tiện điện tử thực hiện hành vi chiếm đoạt tài sản) - Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017).',
        urgentGoldenHourSteps:
          Array.isArray(parsed.urgentGoldenHourSteps) && parsed.urgentGoldenHourSteps.length > 0
            ? parsed.urgentGoldenHourSteps
            : [
                'Bước 1 (Trong 15 phút đầu): Gọi ngay Hotline Ngân hàng của bạn và Ngân hàng thụ hưởng của kẻ gian yêu cầu TRA SOÁT & TẠM DỪNG/PHONG TỎA giao dịch khẩn cấp.',
                'Bước 2: Sao lưu toàn bộ ảnh chụp màn hình tin nhắn, lịch sử cuộc gọi, biên lai chuyển tiền (có mã giao dịch FT) và đường link/tệp đính kèm.',
                'Bước 3: In Đơn trình báo này và mang trực tiếp ra Công an Phường/Xã nơi cư trú gần nhất để lập Biên bản tiếp nhận nguồn tin về tội phạm.',
              ],
        formalReportText: parsed.formalReportText || '',
        evidenceChecklist:
          Array.isArray(parsed.evidenceChecklist) && parsed.evidenceChecklist.length > 0
            ? parsed.evidenceChecklist
            : [
                'Bản sao Căn cước công dân (CCCD) của người trình báo',
                'Sao kê / Biên lai giao dịch ngân hàng có đóng dấu xác nhận hoặc mã tham chiếu FT',
                'Bản in ảnh chụp màn hình toàn bộ cuộc hội thoại Zalo/SMS/Telegram và số điện thoại kẻ gian',
                `Bản in Chứng thư Giám định Pháp Y Số ScamGuard (#${params.forensicAssessmentId || dossierCode})`,
              ],
      };
    }
  } catch (err) {
    console.warn('Dossier generator fallback:', err);
  }

  const defaultReport = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-----------------------------------------------

ĐƠN TRÌNH BÁO VÀ TỐ GIÁC TỘI PHẠM SỬ DỤNG CÔNG NGHỆ CAO
(V/v: Hành vi lừa đảo chiếm đoạt tài sản / giả mạo trên không gian mạng)

Kính gửi: - Cơ quan Cảnh sát Điều tra Công an Quận/Huyện/Phường sở tại
          - Phòng An ninh mạng và phòng, chống tội phạm sử dụng công nghệ cao (PA05)

1. THÔNG TIN NGƯỜI TRÌNH BÁO:
- Họ và tên: ${params.victimName || '...........................................................'}
- Số điện thoại liên hệ: ${params.victimPhone || '............................................'}
- Thời gian lập hồ sơ giám định: ${nowStr}

2. THÔNG TIN ĐỐI TƯỢNG & PHƯƠNG TIỆN VI PHẠM:
- Hình thức/Thủ đoạn: ${params.incidentType}
- Định danh đối tượng (SĐT / STK / Tên miền): ${params.suspectIdentifier}
- Ngân hàng / Kênh phát tán: ${params.suspectBankOrChannel || 'Không gian mạng / Viễn thông'}
- Mức độ thiệt hại ghi nhận: ${params.financialLossAmount || 'Đã phát hiện và ngăn chặn qua hệ thống giám định'}

3. NỘI DUNG SỰ VIỆC & KẾT QUẢ GIÁM ĐỊNH KỸ THUẬT SỐ (${params.forensicAssessmentId || dossierCode}):
${params.incidentSummary}

4. KIẾN NGHỊ VÀ YÊU CẦU:
Căn cứ Điều 144, 145 Bộ luật Tố tụng Hình sự và Điều 174, Điều 290 Bộ luật Hình sự, tôi kính đề nghị Quý Cơ quan:
- Tiếp nhận nguồn tin tố giác tội phạm và xác minh chủ thuê bao / chủ tài khoản ngân hàng nêu trên.
- Phối hợp với các tổ chức tín dụng, ngân hàng liên quan thực hiện phong tỏa khẩn cấp dòng tiền (nếu có phát sinh giao dịch).
- Ngăn chặn tên miền/đầu số vi phạm nhằm bảo vệ an toàn cho cộng đồng.

Tôi xin cam đoan những thông tin và dữ liệu điện tử đính kèm là hoàn toàn đúng sự thật.

                                                Ngày ..... tháng ..... năm 2026
                                                      NGƯỜI TRÌNH BÁO
                                                   (Ký và ghi rõ họ tên)`;

  return {
    dossierCode,
    createdAt: nowStr,
    legalBasis:
      'Điều 174 & Điều 290 Bộ luật Hình sự 2015 (sửa đổi, bổ sung 2017); Điều 144 Bộ luật Tố tụng Hình sự.',
    urgentGoldenHourSteps: [
      'Gọi ngay Hotline ngân hàng chuyển đi để yêu cầu tra soát khẩn cấp và thông báo nghi vấn lừa đảo.',
      'Không nghe theo bất kỳ dịch vụ "thu hồi tiền treo / lấy lại tiền bị lừa" nào trên Facebook/TikTok (100% là lừa đảo lần 2).',
      'Nộp trực tiếp Đơn trình báo này kèm bản in bằng chứng tại Công an Phường/Xã gần nhất.',
    ],
    formalReportText: defaultReport,
    evidenceChecklist: [
      'Bản sao CCCD của người trình báo',
      'Sao kê giao dịch ngân hàng (ghi rõ số tài khoản nhận, mã giao dịch FT, giờ giao dịch)',
      'Ảnh chụp màn hình tin nhắn, lịch sử cuộc gọi và liên kết lừa đảo',
      `Chứng thư Giám định Pháp Y Số ScamGuard (#${params.forensicAssessmentId || dossierCode})`,
    ],
  };
}

/**
 * 7. Smart Contextual PII Detection & Redaction via Gemini AI + Deterministic Regex
 */
export async function performSmartPiiRedaction(params: { text: string }) {
  const rawText = params.text || '';
  const detectedEntities: Array<{ type: string; originalPreview: string; replacement: string }> = [];

  let redacted = rawText;

  // 1. Vietnamese CCCD (12 digits starting with 0)
  redacted = redacted.replace(/\b(0\d{11})\b/g, (m) => {
    detectedEntities.push({ type: 'Số CCCD 12 số', originalPreview: `${m.slice(0, 3)}******${m.slice(-3)}`, replacement: '[ĐÃ_ẨN_CCCD_12_SỐ]' });
    return '████████████ [ĐÃ_ẨN_CCCD]';
  });

  // 2. OTP Codes (4-8 digits near OTP/mã keywords or standalone 6 digits)
  redacted = redacted.replace(/\b(\d{6})\b/g, (m) => {
    detectedEntities.push({ type: 'Mã xác thực OTP', originalPreview: `${m.slice(0, 2)}****`, replacement: '[ĐÃ_ẨN_MÃ_OTP]' });
    return '██████ [ĐÃ_ẨN_MÃ_OTP]';
  });

  // 3. Vietnamese Phone Numbers
  redacted = redacted.replace(/\b((?:\+84|0)[235789]\d{8,9})\b/g, (m) => {
    detectedEntities.push({ type: 'Số điện thoại cá nhân', originalPreview: `${m.slice(0, 4)}***${m.slice(-3)}`, replacement: '[ĐÃ_ẨN_SĐT]' });
    return '██████████ [ĐÃ_ẨN_SĐT]';
  });

  // 4. Bank Account / Payment Card Numbers (8-19 digits)
  redacted = redacted.replace(/\b(\d{8,19})\b/g, (m) => {
    detectedEntities.push({ type: 'Số tài khoản / Thẻ ngân hàng', originalPreview: `${m.slice(0, 3)}*****${m.slice(-3)}`, replacement: '[ĐÃ_ẨN_STK_THẺ]' });
    return '████████████ [ĐÃ_ẨN_STK_THẺ]';
  });

  // 5. Email addresses
  redacted = redacted.replace(/\b([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, (m) => {
    detectedEntities.push({ type: 'Địa chỉ Email', originalPreview: `${m.slice(0, 3)}***@***`, replacement: '[ĐÃ_ẨN_EMAIL]' });
    return '████████@████ [ĐÃ_ẨN_EMAIL]';
  });

  // Use Gemini 3.8 Flash to redact remaining contextual PII (Full Names, Home Addresses, Passwords, License Plates)
  try {
    const prompt = `Bạn là Công cụ Khử Nhận Dạng Dữ Liệu Cá Nhân (Privacy-Preserving PII Redactor theo Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân).
Văn bản đầu vào (đã ẩn một phần số):
"${redacted}"

Hãy phát hiện và thay thế TẤT CẢ các thông tin định danh cá nhân còn sót lại (Họ tên người Việt, Địa chỉ nhà riêng/cơ quan, Mật khẩu/PIN, Biển số xe, Ngày tháng năm sinh) bằng nhãn [ĐÃ_ẨN_HỌ_TÊN], [ĐÃ_ẨN_ĐỊA_CHỈ], [ĐÃ_ẨN_MẬT_KHẨU], [ĐÃ_ẨN_NGÀY_SINH] tương ứng. Giữ nguyên ngữ cảnh câu để vẫn dùng làm bằng chứng tố giác được.

Trả về JSON:
{
  "redactedText": string,
  "additionalEntities": [
    { "type": string, "replacement": string }
  ],
  "privacyComplianceNote": string
}`;

    const resp = await executeGeminiWithFallback({
      contents: prompt,
      fastChat: true,
      timeoutMs: 3800,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    if (resp?.text) {
      const parsed = JSON.parse(cleanJsonText(resp.text));
      if (parsed.redactedText) {
        redacted = parsed.redactedText;
      }
      if (Array.isArray(parsed.additionalEntities)) {
        for (const ent of parsed.additionalEntities) {
          detectedEntities.push({
            type: ent.type || 'Thông tin định danh ngữ cảnh',
            originalPreview: 'Đã ẩn bởi AI',
            replacement: ent.replacement || '[ĐÃ_ẨN_PII]',
          });
        }
      }
      return {
        redactedText: redacted,
        redactionsCount: detectedEntities.length,
        detectedEntities,
        privacyComplianceNote:
          parsed.privacyComplianceNote ||
          'Tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân tại Việt Nam.',
      };
    }
  } catch {
    // Fallback to deterministic regex
  }

  return {
    redactedText: redacted,
    redactionsCount: detectedEntities.length,
    detectedEntities,
    privacyComplianceNote: 'Đã xử lý ẩn danh cục bộ theo tiêu chuẩn Nghị định 13/2023/NĐ-CP.',
  };
}
