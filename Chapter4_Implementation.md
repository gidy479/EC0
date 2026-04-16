# CHAPTER 4: Implementation & Documentation of the Proposed System

## 4.1 Introduction

### Purpose of This Chapter
This chapter outlines the testing, implementation, and documentation processes applied to the proposed system. It explains the strategies and methodologies used to ensure that the user-facing e-commerce platform, backend escrow services, and administrator dashboards are fully functional, reliable, secure, and ready for end-users. Thorough validation and structured deployment are critical to a smooth transition and project success.

---

## 4.2 Testing Approaches

To ensure the reliability of the system, testing was conducted across multiple layers of the application. 

### 4.2.1 Unit Testing
Tests individual components or modules in isolation to verify each unit functions correctly before integration. In this system, this involved validating isolated backend routes, password hashing algorithms, and individual UI components.

### 4.2.2 Functional Testing
Validates the system against functional requirements, ensuring each core feature behaves as expected. This included rigorous verification of user registration flows, product additions, escrow payment processes, and wallet withdrawal mechanics.

### 4.2.3 Usability Testing
Evaluates the ease of use and overall user experience, gathering feedback from real or representative users. This step was crucial for refining the mobile responsiveness of the platform and ensuring intuitive marketplace navigation.

### 4.2.4 Acceptance Testing
Confirms the system meets defining business requirements and is comprehensively approved by stakeholders before the designated go-live period. 

### 4.2.5 Selected Approach
**Functional and Acceptance Testing** was utilized as the primary approach, supported by ongoing Unit tests. Because the platform facilitates financial transactions and sensitive user data, Functional Testing was deemed essential to ensure that integrated business logic (such as order placements and payment escrow) operated flawlessly from end to end. Acceptance Testing ultimately confirmed that the core organizational goals—building a secure, trustworthy, and autonomous marketplace—were fundamentally realized prior to deployment.

### 4.2.6 Test Data & Execution Examples

To validate the system comprehensively, specific test cases with sample data were executed across key modules:

**1. Authentication Testing (Unit & Functional)**
* **Scenario Setup**: Attempting to register a new vendor.
* **Test Data Input**: 
  * Name: `Jane Doe`
  * Email: `jane.merchant@test.com`
  * Password: `password123` (Weak) vs. `Str0ngP@ssw0rd!` (Strong)
* **Expected Result**: The weak password should trigger a validation error overlay. The strong password should successfully encrypt (bcrypt) and return a valid JWT token.
* **Actual Result**: Weak password rejected; strong password accepted and JWT generated successfully.

**2. AI Product Verification (Functional)**
* **Scenario Setup**: Adding a product to trigger the AI anti-greenwashing filter.
* **Test Case A (Legitimate Claims)**:
  * **Input**: Name: `Bamboo Toothbrush`, Description: `Made from sustainably sourced bamboo with FSC standard certification.`, Eco-labels: `FSC`.
  * **Result**: AI returned `"verified"` status with 98% confidence.
* **Test Case B (Greenwashing Falsehoods)**:
  * **Input**: Name: `Eco Shirt`, Description: `100% natural magic for the earth. Completely green.`, Eco-labels: `None`.
  * **Result**: AI returned `"rejected"` status for vague, unsubstantiated claims.

**3. Escrow & Wallet Withdrawal (Acceptance)**
* **Scenario Setup**: Vendor requests to withdraw a cleared balance from their dashboard.
* **Test Data Input**: 
  * Available Wallet Balance: `GH₵ 500.00`
  * Withdrawal Request: `GH₵ 150.00`
  * Method: `Mobile Money (MTN, +23354XXXXXXX)`
* **Expected Result**: Successful platform request. Wallet deduction applies instantly, lowering balance to `GH₵ 350.00`.
* **Actual Result**: Balance successfully updated. Transaction recorded accurately on the Admin Dashboard for processing.

---

## 4.3 Implementation Strategies

Various deployment strategies were considered to successfully transition the system into production:

### 4.3.1 Parallel
Old and new systems run simultaneously, allowing comparison and fallback if the new system encounters issues.

### 4.3.2 Pilot
The system is rolled out in one location or to a specific subset of the target audience first, before expanding to the full organization.

### 4.3.3 Direct
The old workflow is immediately replaced by the new system — a faster rollout but carrying a higher risk without an immediate fallback plan.

### 4.3.4 Phased
System modules are introduced gradually in stages, reducing disruption and allowing progressive user adoption.

### 4.3.5 Selected Strategy
A **Phased Implementation** strategy was selected to minimize disruption. Due to the complexity of the escrow payments and wallet withdrawal integrations, core modules such as user authentication and product browsing were deployed first. The secondary phase introduced the financial integrations and checkout processes, followed finally by the administrative management dashboard. This progressive rollout mitigated risks and facilitated smooth issue resolution during production.

---

## 4.4 System Documentation

To ensure ease of maintenance, onboarding, and sustainable usage, the platform was meticulously documented.

**1. Functional Overview**  
The system operates as an end-to-end web platform featuring a dynamic React-based frontend and a secure Node.js/Express backend. Key capabilities include comprehensive vendor and product management, escrow-based financial transactions, Mobile Money/bank withdrawal gateways, and centralized administrative controls.

**2. Screenshots & UI Walkthrough**  

The following section provides a visual walkthrough of the platform's core functional components:

**A. User Registration and Authentication Flow**
*Walkthrough:* New users access the registration portal where they input their details. The system employs secure JWT authentication to log the user in. A validation overlay ensures robust password policies are strictly met, protecting user credentials.
> *[Insert Screenshot Here: Figure 4.1 - User Registration Portal showing validation feedback]*

**B. The EcoMarket Plus Marketplace Homepage**
*Walkthrough:* Upon authentication, users are greeted by the main marketplace grid. The layout is fully mobile-responsive and dynamically displays product images loaded from the production backend API. Users can easily browse categories and view real-time pricing.
> *[Insert Screenshot Here: Figure 4.2 - Marketplace Homepage showcasing the responsive product grid]*

**C. Secure Checkout and Escrow Payment Interface**
*Walkthrough:* When a buyer initiates a purchase, they are directed to the secure checkout page. Here, they thoroughly review their order and confirm the escrow payment strategy, visually reassuring them that their funds are held securely until the physical order is fulfilled.
> *[Insert Screenshot Here: Figure 4.3 - Checkout Interface detailing the Escrow payment confirmation]*

**D. Vendor Dashboard and Wallet Withdrawal**
*Walkthrough:* Vendors utilize a personal dashboard to monitor product listings, review order histories, and track sales revenue. The integrated wallet view allows them to formally request fund withdrawals using localized options such as Mobile Money or direct Bank Transfers.
> *[Insert Screenshot Here: Figure 4.4 - Vendor Dashboard navigating to the Wallet Balance and Withdrawal controls]*

**E. Administrator Management Console**
*Walkthrough:* The specialized admin console features overarching platform analytics. Administrators can seamlessly view total registered users, audit system-wide escrow transactions, ensure data integrity, and resolve any operational routing anomalies or 404 errors encountered within the system.
> *[Insert Screenshot Here: Figure 4.5 - Administrator Dashboard showing active platform metrics and order statuses]*

**3. User Needs Alignment**  
Each feature was purposefully engineered to address specific user and organizational needs. The escrow payment workflow aligns directly with the necessity for buyer-seller trust online. Mobile-first design elements ensure accessibility for modern smartphone shoppers, and customizable wallet withdrawals provide vendors with needed financial autonomy.

**4. Operational Guide**  
The following serves as a detailed operational manual for configuring and using the system:

**A. System Requirements & Setup**
Before operating the application, ensure the host environment meets the necessary technical specifications:
* **Operating System**: Linux, macOS, or Windows.
* **Dependencies**: Node.js (v18+), npm, and a running MongoDB instance.
* **Environment Variables**: Configure `.env` files for both the backend (Database URI, JWT secret, Gemini API key) and frontend (Vite API Base URL).

**B. Starting the Application**
For local development: Open two terminals. In `backend/`, run `npm run dev` to start the Express API. In `frontend/`, run `npm run dev` to launch the React interface.
For production: The application is served statically from the backend. Run `npm run build:full` to compile the frontend, then start the server via `npm start`.

**C. Vendor / Merchant Operations**
* **Adding a Product**: Log in with a Merchant account, navigate to the "List Product" interface, fill in product specifics, and upload a clear product image. Clicking "Submit" automatically triggers the AI Verification process.
* **Wallet Withdrawals**: From the Vendor Dashboard, access the Wallet. If funds are available, click "Request Withdrawal," select the preferred payment method (Mobile Money or Bank Transfer), specify the amount, and submit the request. 

**D. Buyer Operations**
Browse the mobile-responsive marketplace and look for the "AI Verified" badge to ensure sustainable claims are legitimate. Add items to the cart and proceed to Checkout. Payments are held securely in Escrow until the product is fulfilled.

**E. Administrator Troubleshooting**
Administrators can log in to view the Admin Dashboard and audit order statuses.
* **Image Errors (404s)**: Ensure the backend `/uploads` folder is intact and the frontend `API_BASE_URL` exactly matches the backend hosting URL.
* **AI Verification API Limits**: If the Gemini AI service hits a limit, the system gracefully falls back and sets the product's verification status to `failed` without crashing. Vendors are meant to try again later.

---

## 4.5 Implementation Challenges

Transitioning from local development to production presented several operational difficulties, which were methodically addressed.

**Challenges Faced:**
* **Technical Compatibility:** Formatting discrepancies between local development image paths and the production API URLs caused visual rendering issues.
* **Timeline Constraints:** Limited testing time within initial project deadlines added pressure to the final stages of the deployment cycle.
* **Resistance to Change:** Initial hesitation from end users in adapting to new, stricter security workflows and the novel escrow framework.
* **Data Migration & Integrity Issues:** Platform errors stemming from users attempting to access order histories linked to deleted products.
* **Unexpected Routing Bugs:** 404 anomalies discovered during UAT, particularly within the administrator and authentication portals.

**Solutions & Workarounds:**
* **Conducted Integration Testing:** Built a custom frontend utility function to reliably map API bases, solving the technical production URL compatibility issues.
* **Adopted Agile Sprints:** Utilized time-boxed Agile sprints to intensely prioritize and test critical functionality paths, such as the checkout and authentication processes. 
* **Organized Stakeholder Demos:** Executed strategic demonstrations to showcase the tangible security benefits of the new platform, building user confidence.
* **Validated Data Architectures:** Implemented backend logic to validate data integrity alongside pre-migration checksums, ensuring deleted assets would flexibly filter out of live API calls.
* **Maintained a Bug Log:** Maintained a strict priority bug log to quickly identify, trace, and rectify unexpected 404 errors prior to launch.

---

## 4.6 Chapter Summary & Chapter 5 Preview

### Chapter 4 Key Takeaways
* Four testing approaches were evaluated; a hybrid of Functional and Acceptance Testing was selected for end-to-end validation.
* A Phased implementation strategy was chosen and executed to intentionally structure the rollout and minimize operational disruption.
* The system is fully documented in functionality, operations, and visual workflows.
* System implementation challenges, from data integrity to deployment bugs, were identified and solved with practical, technical workarounds.
* The system was successfully verified against the core user and organizational needs outlined initially in the project scope.

### Chapter 5 Preview

**5.1 Introduction**  
Links Chapter 4 deployment findings to the finalized system conclusion.

**5.2 Summary**  
A comprehensive recap of the core research objectives and the specific societal/e-commerce problem addressed.

**5.3 Limitations**  
An honest academic reflection on the constraints of the developed platform and study.

**5.4 Recommendations**  
Directions and considerations for future research, system scaling, and development.

**5.5 Conclusion**  
Final synthesis and overarching lessons learned over the course of the project.
