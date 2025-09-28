# ✅ Jenkins CI/CD Pipeline Setup Checklist

## 🎯 Mục Tiêu: Chạy thành công Jenkins pipeline với 8 stages

### 📋 Phase 1: Chuẩn Bị Jenkins Environment

#### ✅ Bước 1.1: Truy Cập Jenkins
- [ ] Mở trình duyệt và truy cập: **http://localhost:8080**
- [ ] Đăng nhập vào Jenkins (nếu chưa setup, làm theo initial setup wizard)
- [ ] Xác nhận Jenkins dashboard hiển thị thành công

#### ✅ Bước 1.2: Cài Đặt Plugins
- [ ] Vào **Manage Jenkins** → **Manage Plugins** → **Available** 
- [ ] Tìm và cài đặt các plugins sau (tick vào Install):

**🔧 Core Plugins (BẮT BUỘC):**
- [ ] Pipeline
- [ ] Git Plugin
- [ ] NodeJS Plugin
- [ ] Build Timeout Plugin
- [ ] AnsiColor Plugin
- [ ] Timestamper Plugin

**📊 Quality & Testing:**
- [ ] Checkstyle Plugin
- [ ] Warnings Next Generation Plugin
- [ ] JUnit Plugin

**🔒 Security & Deployment:**
- [ ] Credentials Plugin (thường có sẵn)
- [ ] SSH Agent Plugin
- [ ] Snyk Security Plugin

**🔔 Notifications:**
- [ ] Email Extension Plugin
- [ ] Slack Notification Plugin (tùy chọn)

- [ ] Click **"Install without restart"** hoặc **"Download now and install after restart"**
- [ ] Chờ plugins cài đặt hoàn tất (có thể mất 5-10 phút)

#### ✅ Bước 1.3: Cấu Hình Global Tools
- [ ] Vào **Manage Jenkins** → **Global Tool Configuration**

**📦 NodeJS Configuration:**
- [ ] Scroll down tới **NodeJS installations**
- [ ] Click **"Add NodeJS"**
- [ ] Name: `NodeJS-20`
- [ ] ✅ Check **"Install automatically"**
- [ ] Version: Chọn **NodeJS 20.x** (version mới nhất)
- [ ] Click **Save**

**📡 Git Configuration:**
- [ ] Scroll tới **Git installations** 
- [ ] Verify **Path to Git executable**: `/usr/bin/git`
- [ ] Nếu chưa có, click **"Add Git"** và set path

---

### 🔐 Phase 2: Cấu Hình Credentials

#### ✅ Bước 2.1: Tạo GitHub Personal Access Token
- [ ] Mở tab mới: **https://github.com/settings/tokens**
- [ ] Click **"Generate new token"** → **"Generate new token (classic)"**
- [ ] Note: `Jenkins CI/CD Pipeline`
- [ ] Expiration: `90 days` (hoặc `No expiration`)
- [ ] Select scopes:
  - [ ] ✅ **repo** (Full control of private repositories)
  - [ ] ✅ **workflow** (Update GitHub Action workflows)
  - [ ] ✅ **write:packages** (Upload packages)
- [ ] Click **"Generate token"**
- [ ] **📋 Copy token ngay** (sẽ không hiển thị lại)

#### ✅ Bước 2.2: Tạo Snyk Account & Token
- [ ] Mở tab mới: **https://snyk.io/**
- [ ] Click **"Sign up for free"** (hoặc login nếu đã có account)
- [ ] Verify email và complete onboarding
- [ ] Vào **Account Settings** → **API Token**
- [ ] Click **"Generate token"**
- [ ] **📋 Copy Snyk token**

#### ✅ Bước 2.3: Thêm Credentials vào Jenkins
- [ ] Quay lại Jenkins → **Manage Jenkins** → **Manage Credentials**
- [ ] Click **"Jenkins"** → **"Global credentials (unrestricted)"** → **"Add Credentials"**

**Tạo 5 credentials sau:**

1. **GitHub Token:**
   - [ ] Kind: **Secret text**
   - [ ] Scope: **Global**
   - [ ] Secret: `[paste GitHub token]`
   - [ ] ID: `github-token`
   - [ ] Description: `GitHub Personal Access Token`
   - [ ] Click **OK**

2. **Snyk Token:**
   - [ ] Kind: **Secret text**
   - [ ] Secret: `[paste Snyk token]`
   - [ ] ID: `snyk-token`
   - [ ] Description: `Snyk API Token`
   - [ ] Click **OK**

3. **JWT Secret:**
   - [ ] Kind: **Secret text**
   - [ ] Secret: `LzyDob4G63bCtpyHMSDxmA6mEE04b2hqFtOtztxPUPE=` (từ script output)
   - [ ] ID: `jwt-secret`
   - [ ] Description: `JWT Secret Key`
   - [ ] Click **OK**

4. **Session Secret:**
   - [ ] Kind: **Secret text**
   - [ ] Secret: `nDOdQ07dlVnhBziBF3wdO/Q4pbRYMzqV/D+XK2NNR6A=` (từ script output)
   - [ ] ID: `session-secret`
   - [ ] Description: `Session Secret Key`
   - [ ] Click **OK**

5. **Encryption Key:**
   - [ ] Kind: **Secret text**
   - [ ] Secret: `KXg0+AoWx1i+l4U9JH3p7F/9OnaYCZ9dnJaJMDu8vw8=` (từ script output)
   - [ ] ID: `encryption-key`
   - [ ] Description: `Encryption Key`
   - [ ] Click **OK**

- [ ] Verify có 5 credentials được tạo thành công

---

### 🚀 Phase 3: Tạo Pipeline Job

#### ✅ Bước 3.1: Tạo New Pipeline Job
- [ ] Từ Jenkins Dashboard, click **"New Item"**
- [ ] Item name: `10.1P-Butterfly-Club-Pipeline`
- [ ] Chọn **"Pipeline"**
- [ ] Click **OK**

#### ✅ Bước 3.2: Cấu Hình Pipeline
**General Configuration:**
- [ ] Description: `CI/CD Pipeline for 10.1P Butterfly Club with 8 stages`

**Build Triggers:**
- [ ] ✅ Check **"GitHub hook trigger for GITScm polling"**
- [ ] ✅ Check **"Poll SCM"**
- [ ] Schedule: `H/5 * * * *`

**Pipeline Configuration:**
- [ ] Definition: **"Pipeline script from SCM"**
- [ ] SCM: **Git**
- [ ] Repository URL: `https://github.com/datnq2001/SIT753_7.3.git`
- [ ] Credentials: **github-token** (select từ dropdown)
- [ ] Branches to build - Branch Specifier: `*/main`
- [ ] Repository browser: **(Auto)**
- [ ] Script Path: `Jenkinsfile`
- [ ] ✅ Check **"Lightweight checkout"**

#### ✅ Bước 3.3: Lưu Configuration
- [ ] Click **Save**
- [ ] Verify pipeline job được tạo thành công
- [ ] Verify job hiển thị trong Jenkins dashboard

---

### 🎯 Phase 4: Chạy Pipeline Lần Đầu

#### ✅ Bước 4.1: Trigger First Build
- [ ] Từ pipeline job page, click **"Build Now"**
- [ ] Verify build bắt đầu chạy (sẽ xuất hiện trong Build History)
- [ ] Click vào build number (ví dụ: **#1**) để theo dõi

#### ✅ Bước 4.2: Monitor Pipeline Execution
- [ ] Click **"Console Output"** để xem logs real-time
- [ ] Theo dõi từng stage thực thi:

**Expected Pipeline Flow:**
- [ ] 🔄 **Stage 1: Checkout** - Should complete in ~30s
- [ ] 🚀 **Stage 2: Build** - npm install, environment setup (~2-3min)
- [ ] 🧪 **Stage 3: Test** - Unit/Integration/Performance tests (~3-5min)
- [ ] 📋 **Stage 4: Code Quality** - ESLint, complexity analysis (~2-4min)
- [ ] 🔒 **Stage 5: Security** - Snyk scan, secret detection (~3-7min)
- [ ] 🚀 **Stage 6: Deploy** - Staging deployment (~2-3min)
- [ ] 🎯 **Stage 7: Release** - Production approval (nếu main branch)
- [ ] 📊 **Stage 8: Monitoring** - Setup monitoring (~1-2min)

#### ✅ Bước 4.3: Troubleshooting (nếu cần)

**Nếu Stage Build fails:**
- [ ] Check NodeJS tool configuration
- [ ] Verify `package.json` exists trong repository
- [ ] Check console output cho npm install errors

**Nếu Stage Security fails:**
- [ ] Verify Snyk token là valid
- [ ] Check Snyk account có hoạt động
- [ ] Có thể skip Snyk bằng cách comment out trong Jenkinsfile

**Nếu Credentials errors:**
- [ ] Verify tất cả 5 credentials được tạo với đúng IDs
- [ ] Check credential IDs match exactly (case sensitive)

---

### 📊 Phase 5: Verify Success

#### ✅ Bước 5.1: Check Build Results
- [ ] Build completed với status **SUCCESS** (green)
- [ ] Tất cả 8 stages marked as **PASSED**
- [ ] No critical errors trong console output
- [ ] Build artifacts được archived

#### ✅ Bước 5.2: Check Generated Reports
- [ ] Click vào build → **"Workspace"**
- [ ] Verify các files được tạo:
  - [ ] `test-results.txt`
  - [ ] `eslint-report.xml`
  - [ ] `security-audit-report.txt`
  - [ ] `monitoring/` directory

#### ✅ Bước 5.3: Test Automatic Triggers
- [ ] Make a small change trong repository (ví dụ: edit README.md)
- [ ] Commit và push lên GitHub
- [ ] Verify Jenkins automatically trigger new build trong 5 phút
- [ ] Check new build chạy thành công

---

### 🎉 Phase 6: Production Readiness

#### ✅ Bước 6.1: Test Production Release (Optional)
- [ ] Trigger build trên `main` branch
- [ ] Khi đến Stage 7 (Release), sẽ có **Input Required**
- [ ] Click **"Proceed"** để approve production release
- [ ] Verify production release completes successfully

#### ✅ Bước 6.2: Setup Email Notifications (Optional)
- [ ] Vào **Manage Jenkins** → **Configure System**
- [ ] Scroll to **Extended E-mail Notification**
- [ ] Configure SMTP settings
- [ ] Test email notifications

---

## 🏆 SUCCESS CRITERIA

### ✅ Pipeline is successful when:
- [ ] All 8 stages execute without errors
- [ ] Build completes in 15-25 minutes
- [ ] No high/critical security vulnerabilities found
- [ ] Code quality gates passed
- [ ] Staging deployment successful
- [ ] Monitoring configuration created
- [ ] Email notifications sent (if configured)

### 🚨 If any step fails:
1. **Check console output** for specific error messages
2. **Review troubleshooting section** trong JENKINS_DEPLOYMENT_GUIDE.md
3. **Run verification script**: `./verify_pipeline_setup.sh`
4. **Double-check credentials** và tool configurations

---

## 📚 Documentation References

- **JENKINS_DEPLOYMENT_GUIDE.md** - Chi tiết technical setup
- **QUICK_START_GUIDE.md** - Overview và architecture
- **verify_pipeline_setup.sh** - Automated verification
- **PROJECT_COMPLETION_REPORT.md** - Complete implementation summary

---

**🎯 Current Progress: Ready to start Phase 1**

Hãy bắt đầu từ **Phase 1: Chuẩn Bị Jenkins Environment** và làm theo từng checkbox một cách tuần tự!