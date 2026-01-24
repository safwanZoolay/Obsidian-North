/**
 * Obsidian North - Main Application Logic
 */

class ObsidianApp {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatSend = document.getElementById('chat-send');
        this.quickButtons = document.querySelectorAll('.quick-btn');
        this.isTyping = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupScrollAnimations();
        this.setupCanvas();
    }

    setupEventListeners() {
        // Chat input handlers
        this.chatSend.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Quick action buttons
        this.quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                this.chatInput.value = prompt;
                this.sendMessage();
            });
        });

        // CTA buttons
        document.getElementById('scroll-to-chat')?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.chatInput.focus();
        });

        document.getElementById('schedule-call')?.addEventListener('click', () => {
            this.openBookingModal();
        });

        // Modal
        document.getElementById('close-modal')?.addEventListener('click', () => {
            this.closeBookingModal();
        });

        // Close modal on outside click
        document.getElementById('booking-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'booking-modal') {
                this.closeBookingModal();
            }
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isTyping) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator
        this.showTyping();

        // Simulate AI response (in production, call your AI API)
        setTimeout(() => {
            const response = this.getAIResponse(message);
            this.hideTyping();
            this.addMessage(response, 'bot');
        }, 1500);
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = content;

        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    showTyping() {
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<div class="message-content">●●●</div>';
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTyping() {
        this.isTyping = false;
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    getAIResponse(message) {
        // Simple keyword-based responses (replace with actual AI API in production)
        const lowered = message.toLowerCase();

        if (lowered.includes('service') || lowered.includes('what do you')) {
            return `We specialize in three core services:
                <br/><br/>
                <strong>🚀 Custom Web Apps</strong><br/>
                Full-stack applications built with React, Next.js, and Node.js. Perfect for SaaS platforms, dashboards, and e-commerce.
                <br/><br/>
                <strong>🤖 AI Automation</strong><br/>
                Integrate GPT-4, custom AI models, and automation workflows. From chatbots to document processing.
                <br/><br/>
                <strong>💡 Technical Consulting</strong><br/>
                Expert guidance on architecture, performance, and tech stack selection.
                <br/><br/>
                Which area interests you most?`;
        }

        if (lowered.includes('price') || lowered.includes('cost') || lowered.includes('how much')) {
            return `Our pricing depends on your project scope:
                <br/><br/>
                <strong>MVP Projects:</strong> $15K - $30K (4-8 weeks)<br/>
                <strong>Full Applications:</strong> $30K - $80K (8-16 weeks)<br/>
                <strong>AI Integration:</strong> Starting at $10K<br/>
                <strong>Consulting:</strong> $200/hour
                <br/><br/>
                Want a detailed estimate? Let me ask you a few questions about your project, or we can schedule a call to discuss.`;
        }

        if (lowered.includes('ai') && (lowered.includes('automation') || lowered.includes('integration'))) {
            return `We're experts in AI automation! Here's what we can do:
                <br/><br/>
                • <strong>AI Chatbots:</strong> Custom GPT-4 powered assistants for your business<br/>
                • <strong>Document Processing:</strong> Extract, analyze, and automate document workflows<br/>
                • <strong>Workflow Automation:</strong> Connect AI to your existing tools (Slack, email, databases)<br/>
                • <strong>Custom Models:</strong> Fine-tune models for your specific use case
                <br/><br/>
                Most AI projects take 2-6 weeks and start at $10K. Want to discuss your specific needs?`;
        }

        if (lowered.includes('schedule') || lowered.includes('book') || lowered.includes('call') || lowered.includes('consultation')) {
            setTimeout(() => this.openBookingModal(), 500);
            return `Perfect! Let me open our calendar for you.<br/><br/>
                Pick a time that works best, and we'll discuss your project in detail. Looking forward to chatting! 📅`;
        }

        if (lowered.includes('tech') || lowered.includes('stack') || lowered.includes('technology')) {
            return `We use modern, battle-tested technology:
                <br/><br/>
                <strong>Frontend:</strong> React, Next.js 14, TypeScript, Tailwind CSS<br/>
                <strong>Backend:</strong> Node.js, Python, PostgreSQL, Redis<br/>
                <strong>AI/ML:</strong> OpenAI API, LangChain, Vector databases<br/>
                <strong>DevOps:</strong> Vercel, AWS, Docker, CI/CD
                <br/><br/>
                We choose the right tool for your project - not just what's trendy.`;
        }

        if (lowered.includes('timeline') || lowered.includes('how long') || lowered.includes('time')) {
            return `Typical project timelines:
                <br/><br/>
                <strong>MVP/Prototype:</strong> 4-8 weeks<br/>
                <strong>Full Application:</strong> 8-16 weeks<br/>
                <strong>AI Integration:</strong> 2-6 weeks<br/>
                <strong>Consulting Projects:</strong> 1-4 weeks
                <br/><br/>
                We can work faster if you have tight deadlines - let's discuss your specific timeline!`;
        }

        if (lowered.includes('portfolio') || lowered.includes('examples') || lowered.includes('work')) {
            return `We've built some amazing projects:
                <br/><br/>
                • <strong>AI SaaS Accelerator:</strong> Complete boilerplate that saved clients 6 months of development<br/>
                • <strong>Real-time Analytics Platform:</strong> Processing 50M+ events daily<br/>
                • <strong>E-commerce Optimizer:</strong> Achieved 0.4s load times, 23% conversion lift<br/>
                • <strong>Custom AI Chatbots:</strong> Reduced support tickets by 60%
                <br/><br/>
                Want to see detailed case studies?`;
        }

        // Default response
        return `Great question! I can help you with:
            <br/><br/>
            • Estimating your project cost & timeline<br/>
            • Explaining our services & tech stack<br/>
            • Scheduling a consultation call<br/>
            • Answering technical questions
            <br/><br/>
            What would you like to know more about?`;
    }

    openBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    setupScrollAnimations() {
        const stages = document.querySelectorAll('.build-stage');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.3
        });

        stages.forEach(stage => observer.observe(stage));
    }

    setupCanvas() {
        // Setup canvas animations for wireframe, code, and app stages
        this.animateWireframe();
        this.animateCode();
        this.animateApp();
    }

    animateWireframe() {
        const canvas = document.getElementById('wireframe-canvas');
        if (!canvas) return;

        canvas.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 400 300" style="opacity: 0.6;">
                <style>
                    .wireframe-line { stroke: #3b82f6; stroke-width: 2; fill: none; opacity: 0.5; }
                    .wireframe-box { fill: rgba(59, 130, 246, 0.1); stroke: #3b82f6; stroke-width: 1; }
                    @keyframes drawLine {
                        from { stroke-dashoffset: 1000; }
                        to { stroke-dashoffset: 0; }
                    }
                    .animated-line {
                        stroke-dasharray: 1000;
                        animation: drawLine 2s ease-in-out infinite;
                    }
                </style>

                <!-- Header -->
                <rect class="wireframe-box" x="20" y="20" width="360" height="40" rx="4"/>

                <!-- Sidebar -->
                <rect class="wireframe-box" x="20" y="80" width="80" height="200" rx="4"/>

                <!-- Content boxes -->
                <rect class="wireframe-box" x="120" y="80" width="260" height="60" rx="4"/>
                <rect class="wireframe-box" x="120" y="160" width="260" height="60" rx="4"/>
                <rect class="wireframe-box" x="120" y="240" width="120" height="40" rx="4"/>
                <rect class="wireframe-box" x="260" y="240" width="120" height="40" rx="4"/>

                <!-- Animated connection lines -->
                <line class="wireframe-line animated-line" x1="60" y1="80" x2="120" y2="100"/>
                <line class="wireframe-line animated-line" x1="60" y1="180" x2="120" y2="180"/>
            </svg>
        `;
    }

    animateCode() {
        const canvas = document.getElementById('code-canvas');
        if (!canvas) return;

        const codeSnippet = `<span style="color: #8b5cf6">const</span> app = {
  <span style="color: #06b6d4">name</span>: <span style="color: #10b981">'Obsidian North'</span>,
  <span style="color: #06b6d4">build</span>: () => {
    <span style="color: #8b5cf6">return</span> <span style="color: #10b981">'Amazing software'</span>
  }
}`;

        canvas.innerHTML = `
            <pre style="color: #9ca3af; font-family: monospace; font-size: 14px; line-height: 1.8; text-align: left; padding: 2rem;">
${codeSnippet}
            </pre>
        `;
    }

    animateApp() {
        const canvas = document.getElementById('app-canvas');
        if (!canvas) return;

        canvas.innerHTML = `
            <div style="width: 90%; height: 90%; background: rgba(10, 10, 15, 0.8); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></div>
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #f59e0b;"></div>
                    <div style="width: 12px; height: 12px; border-radius: 50%; background: #10b981;"></div>
                </div>
                <div style="height: 30px; background: rgba(59, 130, 246, 0.2); border-radius: 6px;"></div>
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 0.5rem; flex: 1;">
                    <div style="background: rgba(59, 130, 246, 0.1); border-radius: 6px;"></div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="height: 40%; background: rgba(139, 92, 246, 0.1); border-radius: 6px;"></div>
                        <div style="height: 60%; background: rgba(6, 182, 212, 0.1); border-radius: 6px;"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ObsidianApp();
});
