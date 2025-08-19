/**
 * Course Management System - Frontend Application
 * 
 * This JavaScript file contains all the frontend logic for the course management system.
 * It simulates a complete full-stack application using localStorage for data persistence.
 * 
 * Key Features:
 * - Single Page Application (SPA) with client-side routing
 * - Course search and filtering
 * - Admin authentication and course management
 * - Responsive design with modal components
 * - Toast notifications for user feedback
 * 
 * Architecture:
 * - App class: Main application controller
 * - CourseManager: Handles course data operations
 * - AuthManager: Handles authentication
 * - Router: Manages page navigation
 * - UI components for different pages
 */

// =================================
// APPLICATION DATA AND CONFIGURATION
// =================================

/**
 * Sample course data - In a real application, this would come from a MySQL database
 * via REST API endpoints. This data structure matches what you'd get from Sequelize ORM.
 */


// =================================
// UTILITY FUNCTIONS
// =================================

/**
 * Utility class for common operations
 */
class Utils {
    /**
     * Generate a URL-friendly slug from a title
     * @param {string} title - The title to convert
     * @returns {string} - URL-friendly slug
     */
    static createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '') // Remove special characters
            .replace(/\s+/g, '-')        // Replace spaces with hyphens
            .replace(/-+/g, '-')         // Replace multiple hyphens with single
            .trim();
    }

    /**
     * Debounce function to limit how often a function can fire
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Show loading spinner
     */
    static showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    /**
     * Hide loading spinner
     */
    static hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    /**
     * Format number with commas (e.g., 1,000)
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    static formatNumber(num) {
        return num.toLocaleString();
    }
}

// =================================
// TOAST NOTIFICATION SYSTEM
// =================================

/**
 * Toast notification system for user feedback
 */
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, warning, info)
     * @param {number} duration - How long to show toast (ms)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, duration);
    }

    success(message) { this.show(message, 'success'); }
    error(message) { this.show(message, 'error'); }
    warning(message) { this.show(message, 'warning'); }
    info(message) { this.show(message, 'info'); }
}

// =================================
// AUTHENTICATION MANAGER
// =================================

/**
 * Handles user authentication and authorization
 * In a real app, this would communicate with your Node.js/Express backend
 */
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.checkAuthStatus();
  }

  checkAuthStatus() {
    const token = localStorage.getItem('adminToken');
    const username = localStorage.getItem('adminUsername');
    if (token && username) {
      this.currentUser = { username, role: 'admin', token };
    }
  }

  async login(username, password) {
    // Call backend API for login
    const res = await fetch('http://localhost:9000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', data.username);
      this.currentUser = { username: data.username, role: 'admin', token: data.token };
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    this.currentUser = null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('adminToken');
  }

  isAdmin() {
    return this.isAuthenticated();
  }
}


// =================================
// COURSE DATA MANAGER
// =================================

/**
 * Manages course data operations
 * This simulates what would be API calls to your Node.js/Express backend
 * In real app, these methods would make HTTP requests to your REST API
 */
class CourseManager {
  constructor() {
    this.API_BASE = 'http://localhost:9000';
  }

  // === Public API ===

  async getAllCourses() {
    // Public endpoint, no JWT required
    const res = await fetch(`${this.API_BASE}/public/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return await res.json();
  }

  async getCourseById(id) {
    // Optionally implement public get course by ID later
    const courses = await this.getAllCourses();
    return courses.find(course => course.id === Number(id)) || null;
  }

  async searchCourses(query) {
    // TODO: Add search API on the backend for efficiency
    // For now, just filter client-side
    const courses = await this.getAllCourses();
    if (!query.trim()) return courses;
    const q = query.toLowerCase();
    return courses.filter(course =>
      (course.title && course.title.toLowerCase().includes(q)) ||
      (course.description && course.description.toLowerCase().includes(q)) ||
      (course.instructor && course.instructor.toLowerCase().includes(q)) ||
      (Array.isArray(course.tags) && course.tags.some(tag => tag.toLowerCase().includes(q))) ||
      (course.category && course.category.toLowerCase().includes(q))
    );
  }

  async filterCourses(filters = {}) {
    // TODO: Add filter API on the backend. For now, filter client-side.
    let courses = await this.getAllCourses();
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      courses = courses.filter(course =>
        (course.title && course.title.toLowerCase().includes(searchTerm)) ||
        (course.description && course.description.toLowerCase().includes(searchTerm)) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm)) ||
        (Array.isArray(course.tags) && course.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    if (filters.category) {
      courses = courses.filter(course => course.category === filters.category);
    }
    if (filters.level) {
      courses = courses.filter(course => (course.level || '').includes(filters.level));
    }
    return courses;
  }

  getCategories = async () => {
    const courses = await this.getAllCourses();
    return [...new Set(courses.map(c => c.category))];
  };

  getInstructors = async () => {
    const courses = await this.getAllCourses();
    return [...new Set(courses.map(c => c.instructor))];
  };

  // === Admin API (JWT protected) ===

  async addCourse(courseData, token) {
    // courseData: {title, description, etc...}
    // token: admin JWT

    // Construct FormData for file upload
    const formData = new FormData();
    Object.entries(courseData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    const res = await fetch(`${this.API_BASE}/api/courses`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to create course');
    return (await res.json()).course;
  }

  async updateCourse(id, courseData, token) {
    // Use PUT for updating (multipart/form-data for possible image upload)
    const formData = new FormData();
    Object.entries(courseData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });

    const res = await fetch(`${this.API_BASE}/api/courses/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to update course');
    return (await res.json()).course;
  }

  async deleteCourse(id, token) {
    const res = await fetch(`${this.API_BASE}/api/courses/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error('Failed to delete course');
    return true;
  }

  getStatistics = async () => {
    const courses = await this.getAllCourses();
    const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);
    return {
      totalCourses: courses.length,
      totalStudents,
      totalCategories: new Set(courses.map(c => c.category)).size,
      averageRating:
        courses.reduce((sum, c) => sum + (parseFloat(c.rating) || 0), 0) / courses.length || 0,
    };
  };
}


// =================================
// SINGLE PAGE APPLICATION ROUTER
// =================================

/**
 * Simple client-side router for SPA functionality
 * Manages navigation without page reloads
 */
class Router {
    constructor(app) {
        this.app = app;
        this.routes = new Map();
        this.currentRoute = null;

        // Listen for hash changes (navigation)
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    /**
     * Register a route with its handler
     * @param {string} path - Route path (e.g., '/courses')
     * @param {Function} handler - Function to handle the route
     */
    register(path, handler) {
        this.routes.set(path, handler);
    }

    /**
     * Navigate to a specific route
     * @param {string} path - Path to navigate to
     */
    navigate(path) {
        window.location.hash = path;
    }

    /**
     * Handle route changes
     */
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const [path, ...params] = hash.split('/');

        // Update active navigation link
        this.updateActiveNav(hash);

        // Find matching route
        let routeHandler = this.routes.get(hash);
        
        // Handle parameterized routes
        if (!routeHandler) {
            if (hash.startsWith('/course/')) {
                const slug = hash.replace('/course/', '');
                routeHandler = () => this.app.showCourseDetail(slug);
            } else if (hash.startsWith('/admin/courses/edit/')) {
                const id = hash.replace('/admin/courses/edit/', '');
                routeHandler = () => this.app.showEditCourse(id);
            }
        }

        if (routeHandler) {
            this.currentRoute = hash;
            routeHandler();
        } else {
            // Default to home page
            this.navigate('/');
        }
    }

    /**
     * Update active navigation link styling
     * @param {string} currentPath - Current route path
     */
    updateActiveNav(currentPath) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentPath}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Get current route
     * @returns {string} - Current route path
     */
    getCurrentRoute() {
        return this.currentRoute || '/';
    }
}

// =================================
// MAIN APPLICATION CLASS
// =================================

/**
 * Main application class that orchestrates everything
 * This is the central controller for the entire application
 */
class App {
    constructor() {
        // Initialize managers
        this.courseManager = new CourseManager();
        this.authManager = new AuthManager();
        this.toastManager = new ToastManager();
        this.router = new Router(this);

        // DOM elements
        this.mainContent = document.getElementById('main-content');
        this.modal = document.getElementById('course-modal');

        // Application state
        this.currentFilters = {
            search: '',
            category: '',
            level: ''
        };

        // Initialize the application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.setupRoutes();
        this.setupEventListeners();
        this.updateAuthUI();
        
        // Show loading initially
        Utils.showLoading();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initial load
        Utils.hideLoading();
    }

    /**
     * Set up all application routes
     */
    setupRoutes() {
        this.router.register('/', () => this.showHomePage());
        this.router.register('/courses', () => this.showCoursesPage());
        this.router.register('/admin', () => this.showAdminDashboard());
        this.router.register('/admin/login', () => this.showAdminLogin());
        this.router.register('/admin/courses/add', () => this.showAddCourse());
    }

    /**
     * Set up global event listeners
     */
    setupEventListeners() {
        // Authentication button
        const authBtn = document.getElementById('auth-btn');
        authBtn.addEventListener('click', () => {
            if (this.authManager.isAuthenticated()) {
                this.handleLogout();
            } else {
                this.router.navigate('/admin/login');
            }
        });

        // Modal close events
        document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
        document.getElementById('modal-overlay').addEventListener('click', () => this.closeModal());

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    /**
     * Update authentication-related UI elements
     */
    updateAuthUI() {
        const authBtn = document.getElementById('auth-btn');
        const adminLink = document.getElementById('admin-link');
        
        if (this.authManager.isAuthenticated()) {
            authBtn.textContent = 'Logout';
            adminLink.style.display = 'block';
        } else {
            authBtn.textContent = 'Login';
            adminLink.style.display = 'none';
        }
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        this.authManager.logout();
        this.updateAuthUI();
        this.toastManager.success('Successfully logged out');
        this.router.navigate('/');
    }

    // =================================
    // PAGE RENDERING METHODS
    // =================================

    /**
     * Show the home page with search and featured courses
     */
    async showHomePage() {
        const template = document.getElementById('home-template');
        const content = template.content.cloneNode(true);
        
        // Populate category dropdown
        const categoryFilter = content.getElementById('category-filter');
        this.courseManager.getCategories().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Replace main content
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(content);

        // Set up search functionality
        this.setupHomePageEvents();

        // Load and display featured courses
        await this.loadFeaturedCourses();
    }

    /**
     * Set up event listeners for home page
     */
    setupHomePageEvents() {
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const categoryFilter = document.getElementById('category-filter');

        // Search button click
        searchBtn.addEventListener('click', () => this.performSearch());

        // Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Category filter change
        categoryFilter.addEventListener('change', () => this.performSearch());

        // Debounced search as user types
        const debouncedSearch = Utils.debounce(() => this.performSearch(), 500);
        searchInput.addEventListener('input', debouncedSearch);
    }

    /**
     * Perform search and navigate to courses page
     */
    performSearch() {
        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        
        this.currentFilters.search = searchInput.value;
        this.currentFilters.category = categoryFilter.value;
        
        this.router.navigate('/courses');
    }

    /**
     * Load and display featured courses on home page
     */
    async loadFeaturedCourses() {
        Utils.showLoading();
        
        try {
            const courses = await this.courseManager.getAllCourses();
            // Show top 3 rated courses as featured
            const featuredCourses = courses
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3);
            
            const grid = document.getElementById('featured-courses-grid');
            grid.innerHTML = '';
            
            featuredCourses.forEach(course => {
                const courseCard = this.createCourseCard(course);
                grid.appendChild(courseCard);
            });
        } catch (error) {
            this.toastManager.error('Failed to load featured courses');
            console.error('Error loading featured courses:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * Show the courses page with all courses and filters
     */
    async showCoursesPage() {
        const template = document.getElementById('courses-template');
        const content = template.content.cloneNode(true);
        
        // Populate filter dropdowns
        const categoryFilter = content.getElementById('courses-category-filter');
        this.courseManager.getCategories().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Set filter values from current state
        content.getElementById('courses-search').value = this.currentFilters.search || '';
        if (this.currentFilters.category) {
            categoryFilter.value = this.currentFilters.category;
        }

        // Replace main content
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(content);

        // Set up events and load courses
        this.setupCoursesPageEvents();
        await this.loadFilteredCourses();
    }

    /**
     * Set up event listeners for courses page
     */
    setupCoursesPageEvents() {
        const searchInput = document.getElementById('courses-search');
        const categoryFilter = document.getElementById('courses-category-filter');
        const levelFilter = document.getElementById('courses-level-filter');

        // Debounced search
        const debouncedFilter = Utils.debounce(() => this.applyFilters(), 300);

        searchInput.addEventListener('input', debouncedFilter);
        categoryFilter.addEventListener('change', () => this.applyFilters());
        levelFilter.addEventListener('change', () => this.applyFilters());
    }

    /**
     * Apply current filters and reload courses
     */
    async applyFilters() {
        // Get current filter values
        this.currentFilters.search = document.getElementById('courses-search').value;
        this.currentFilters.category = document.getElementById('courses-category-filter').value;
        this.currentFilters.level = document.getElementById('courses-level-filter').value;

        await this.loadFilteredCourses();
    }

    /**
     * Load courses based on current filters
     */
    async loadFilteredCourses() {
        try {
            const courses = await this.courseManager.filterCourses(this.currentFilters);
            
            const grid = document.getElementById('all-courses-grid');
            const resultsCount = document.getElementById('results-count');
            
            // Update results count
            resultsCount.textContent = `${courses.length} course${courses.length !== 1 ? 's' : ''} found`;
            
            // Clear and populate grid
            grid.innerHTML = '';
            
            if (courses.length === 0) {
                grid.innerHTML = '<p class="text-center" style="grid-column: 1/-1; padding: 2rem;">No courses found matching your criteria.</p>';
            } else {
                courses.forEach(course => {
                    const courseCard = this.createCourseCard(course);
                    grid.appendChild(courseCard);
                });
            }
        } catch (error) {
            this.toastManager.error('Failed to load courses');
            console.error('Error loading courses:', error);
        }
    }

    /**
     * Show course detail page
     * @param {string} slug - Course slug
     */
    async showCourseDetail(slug) {
        Utils.showLoading();
        
        try {
            const course = await this.courseManager.getCourseBySlug(slug);
            
            if (!course) {
                this.toastManager.error('Course not found');
                this.router.navigate('/courses');
                return;
            }

            const template = document.getElementById('course-detail-template');
            const content = template.content.cloneNode(true);
            
            // Populate course details
            content.getElementById('course-title').textContent = course.title;
            content.getElementById('course-description').textContent = course.description;
            content.getElementById('course-rating-value').textContent = course.rating;
            content.getElementById('course-students').textContent = Utils.formatNumber(course.students);
            content.getElementById('course-instructor').textContent = course.instructor;
            content.getElementById('course-image').src = course.image;
            content.getElementById('course-image').alt = course.title;
            content.getElementById('course-price').textContent = course.price;
            content.getElementById('course-duration').textContent = course.duration;
            content.getElementById('course-level').textContent = course.level;
            content.getElementById('course-language').textContent = course.language;

            // Populate what you'll learn list
            const learnList = content.getElementById('what-you-learn-list');
            course.whatYouLearn.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                learnList.appendChild(li);
            });

            // Populate prerequisites list
            const prereqList = content.getElementById('prerequisites-list');
            course.prerequisites.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                prereqList.appendChild(li);
            });

            // Populate tags
            const tagsContainer = content.getElementById('course-tags');
            course.tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = 'course-tag';
                span.textContent = tag;
                tagsContainer.appendChild(span);
            });

            // Replace main content
            this.mainContent.innerHTML = '';
            this.mainContent.appendChild(content);

            // Set up enroll button (demo functionality)
            document.getElementById('enroll-btn').addEventListener('click', () => {
                this.toastManager.success(`Successfully enrolled in ${course.title}!`);
            });

        } catch (error) {
            this.toastManager.error('Failed to load course details');
            console.error('Error loading course:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * Show admin login page
     */
    showAdminLogin() {
        // Redirect if already authenticated
        if (this.authManager.isAuthenticated()) {
            this.router.navigate('/admin');
            return;
        }

        const template = document.getElementById('admin-login-template');
        const content = template.content.cloneNode(true);
        
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(content);

        // Set up login form
        this.setupLoginForm();
    }

    /**
     * Set up login form event handlers
     */
    setupLoginForm() {
        const form = document.getElementById('admin-login-form');
        const errorDiv = document.getElementById('login-error');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Clear previous errors
            errorDiv.classList.add('hidden');
            
            // Show loading
            Utils.showLoading();
            
            try {
                const success = await this.authManager.login(username, password);
                
                if (success) {
                    this.updateAuthUI();
                    this.toastManager.success('Successfully logged in!');
                    this.router.navigate('/admin');
                } else {
                    errorDiv.textContent = 'Invalid username or password';
                    errorDiv.classList.remove('hidden');
                }
            } catch (error) {
                this.toastManager.error('Login failed. Please try again.');
                console.error('Login error:', error);
            } finally {
                Utils.hideLoading();
            }
        });
    }

    /**
     * Show admin dashboard (requires authentication)
     */
    async showAdminDashboard() {
        if (!this.authManager.isAuthenticated()) {
            this.router.navigate('/admin/login');
            return;
        }

        const template = document.getElementById('admin-dashboard-template');
        const content = template.content.cloneNode(true);
        
        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(content);

        // Set up events
        document.getElementById('add-course-btn').addEventListener('click', () => {
            this.router.navigate('/admin/courses/add');
        });

        // Load dashboard data
        await this.loadAdminDashboard();
    }

    /**
     * Load data for admin dashboard
     */
    async loadAdminDashboard() {
        Utils.showLoading();
        
        try {
            const [courses, stats] = await Promise.all([
                this.courseManager.getAllCourses(),
                Promise.resolve(this.courseManager.getStatistics())
            ]);

            // Update statistics
            document.getElementById('total-courses').textContent = stats.totalCourses;
            document.getElementById('total-students').textContent = Utils.formatNumber(stats.totalStudents);
            document.getElementById('total-categories').textContent = stats.totalCategories;

            // Populate courses table
            const tableBody = document.getElementById('admin-courses-table');
            tableBody.innerHTML = '';

            courses.forEach(course => {
                const row = this.createAdminTableRow(course);
                tableBody.appendChild(row);
            });

        } catch (error) {
            this.toastManager.error('Failed to load dashboard data');
            console.error('Error loading dashboard:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * Create a table row for admin dashboard
     * @param {Object} course - Course object
     * @returns {HTMLElement} - Table row element
     */
    createAdminTableRow(course) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <div>
                    <strong>${course.title}</strong>
                    <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                        ${course.slug}
                    </div>
                </div>
            </td>
            <td>${course.category}</td>
            <td>${course.instructor}</td>
            <td>${Utils.formatNumber(course.students)}</td>
            <td>${course.rating} ⭐</td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn--sm btn--outline edit-btn" data-id="${course.id}">Edit</button>
                    <button class="btn btn--sm btn--outline delete-btn" data-id="${course.id}" style="color: var(--color-error); border-color: var(--color-error);">Delete</button>
                </div>
            </td>
        `;

        // Add event listeners
        row.querySelector('.edit-btn').addEventListener('click', () => {
            this.router.navigate(`/admin/courses/edit/${course.id}`);
        });

        row.querySelector('.delete-btn').addEventListener('click', () => {
            this.confirmDeleteCourse(course);
        });

        return row;
    }

    /**
     * Show course form for adding new course
     */
    showAddCourse() {
        if (!this.authManager.isAuthenticated()) {
            this.router.navigate('/admin/login');
            return;
        }

        this.showCourseForm();
    }

    /**
     * Show course form for editing existing course
     * @param {string} id - Course ID
     */
    async showEditCourse(id) {
        if (!this.authManager.isAuthenticated()) {
            this.router.navigate('/admin/login');
            return;
        }

        Utils.showLoading();
        
        try {
            const course = await this.courseManager.getCourseById(id);
            if (!course) {
                this.toastManager.error('Course not found');
                this.router.navigate('/admin');
                return;
            }

            this.showCourseForm(course);
        } catch (error) {
            this.toastManager.error('Failed to load course for editing');
            console.error('Error loading course:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * Show course form (add or edit mode)
     * @param {Object|null} course - Course to edit (null for new course)
     */
    showCourseForm(course = null) {
        const template = document.getElementById('course-form-template');
        const content = template.content.cloneNode(true);
        
        // Update title based on mode
        const isEdit = !!course;
        content.getElementById('form-title').textContent = isEdit ? 'Edit Course' : 'Add New Course';
        
        // Populate category dropdown
        const categorySelect = content.getElementById('course-category-input');
        this.courseManager.getCategories().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        // Populate instructor dropdown
        const instructorSelect = content.getElementById('course-instructor-input');
        this.courseManager.getInstructors().forEach(instructor => {
            const option = document.createElement('option');
            option.value = instructor;
            option.textContent = instructor;
            instructorSelect.appendChild(option);
        });

        // If editing, populate form with course data
        if (course) {
            content.getElementById('course-title-input').value = course.title;
            content.getElementById('course-category-input').value = course.category;
            content.getElementById('course-description-input').value = course.description;
            content.getElementById('course-instructor-input').value = course.instructor;
            content.getElementById('course-duration-input').value = course.duration;
            content.getElementById('course-level-input').value = course.level;
            content.getElementById('course-price-input').value = course.price;
            content.getElementById('course-image-input').value = course.image || '';
            content.getElementById('course-language-input').value = course.language;
            content.getElementById('course-tags-input').value = course.tags.join('\n');
            content.getElementById('course-prerequisites-input').value = course.prerequisites.join('\n');
            content.getElementById('course-learn-input').value = course.whatYouLearn.join('\n');
        }

        this.mainContent.innerHTML = '';
        this.mainContent.appendChild(content);

        // Set up form events
        this.setupCourseForm(course);
    }

    /**
     * Set up course form event handlers
     * @param {Object|null} course - Course being edited (null for new)
     */
    setupCourseForm(course) {
        const form = document.getElementById('course-form');
        const cancelBtn = document.getElementById('cancel-form-btn');

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            this.router.navigate('/admin');
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCourseFormSubmit(course);
        });
    }

    /**
     * Handle course form submission
     * @param {Object|null} course - Course being edited (null for new)
     */
    async handleCourseFormSubmit(course) {
        const isEdit = !!course;
        
        // Collect form data
        const formData = {
            title: document.getElementById('course-title-input').value,
            category: document.getElementById('course-category-input').value,
            description: document.getElementById('course-description-input').value,
            instructor: document.getElementById('course-instructor-input').value,
            duration: document.getElementById('course-duration-input').value,
            level: document.getElementById('course-level-input').value,
            price: parseInt(document.getElementById('course-price-input').value),
            image: document.getElementById('course-image-input').value || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
            thumbnail: document.getElementById('course-image-input').value || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300&h=200&fit=crop',
            language: document.getElementById('course-language-input').value,
            tags: document.getElementById('course-tags-input').value,
            prerequisites: document.getElementById('course-prerequisites-input').value,
            whatYouLearn: document.getElementById('course-learn-input').value
        };

        Utils.showLoading();

        try {
            let result;
            if (isEdit) {
                result = await this.courseManager.updateCourse(course.id, formData);
                this.toastManager.success('Course updated successfully!');
            } else {
                result = await this.courseManager.addCourse(formData);
                this.toastManager.success('Course added successfully!');
            }

            if (result) {
                this.router.navigate('/admin');
            }
        } catch (error) {
            this.toastManager.error(`Failed to ${isEdit ? 'update' : 'add'} course`);
            console.error('Course form error:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    /**
     * Confirm course deletion
     * @param {Object} course - Course to delete
     */
    confirmDeleteCourse(course) {
        if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
            this.deleteCourse(course.id);
        }
    }

    /**
     * Delete a course
     * @param {number} id - Course ID
     */
    async deleteCourse(id) {
        Utils.showLoading();

        try {
            const success = await this.courseManager.deleteCourse(id);
            if (success) {
                this.toastManager.success('Course deleted successfully!');
                // Reload dashboard to reflect changes
                await this.loadAdminDashboard();
            } else {
                this.toastManager.error('Failed to delete course');
            }
        } catch (error) {
            this.toastManager.error('Failed to delete course');
            console.error('Delete error:', error);
        } finally {
            Utils.hideLoading();
        }
    }

    // =================================
    // UI COMPONENT CREATION METHODS
    // =================================

    /**
     * Create a course card element
     * @param {Object} course - Course data
     * @returns {HTMLElement} - Course card element
     */
    createCourseCard(course) {
        const template = document.getElementById('course-card-template');
        const card = template.content.cloneNode(true);

        // Populate card data
        const cardElement = card.querySelector('.course-card');
        cardElement.dataset.courseId = course.id;
        
        card.querySelector('.course-image').src = course.thumbnail;
        card.querySelector('.course-image').alt = course.title;
        card.querySelector('.course-title').textContent = course.title;
        card.querySelector('.course-instructor').textContent = `By ${course.instructor}`;
        card.querySelector('.course-description').textContent = course.description;
        card.querySelector('.course-rating').textContent = `${course.rating} ⭐`;
        card.querySelector('.course-students').textContent = `${Utils.formatNumber(course.students)} students`;
        card.querySelector('.course-price').textContent = `$${course.price}`;

        // Add tags
        const tagsContainer = card.querySelector('.course-tags');
        course.tags.slice(0, 3).forEach(tag => {  // Limit to 3 tags for display
            const span = document.createElement('span');
            span.className = 'course-tag';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        // Add click handler for navigation
        cardElement.addEventListener('click', () => {
            this.router.navigate(`/course/${course.slug}`);
        });

        // Make it keyboard accessible
        cardElement.setAttribute('tabindex', '0');
        cardElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.router.navigate(`/course/${course.slug}`);
            }
        });

        return card;
    }

    // =================================
    // MODAL MANAGEMENT
    // =================================

    /**
     * Open modal with content
     * @param {string} title - Modal title
     * @param {HTMLElement} content - Modal content
     */
    openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = '';
        document.getElementById('modal-body').appendChild(content);
        this.modal.classList.remove('hidden');
        
        // Focus on modal for accessibility
        this.modal.focus();
    }

    /**
     * Close modal
     */
    closeModal() {
        this.modal.classList.add('hidden');
    }
}

// =================================
// APPLICATION INITIALIZATION
// =================================

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new App();
    
    console.log('Course Management System initialized successfully!');
    console.log('Features available:');
    console.log('- Browse and search courses');
    console.log('- Admin login (username: admin, password: admin123)');
    console.log('- Add/Edit/Delete courses (admin only)');
    console.log('- Responsive design');
    console.log('- Client-side routing');
    console.log('');
    console.log('For backend integration:');
    console.log('- Replace CourseManager methods with actual API calls');
    console.log('- Implement real JWT authentication');
    console.log('- Connect to MySQL database via Sequelize ORM');
    console.log('- Add proper error handling and validation');
});

/**
 * Handle global errors gracefully
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.app && window.app.toastManager) {
        window.app.toastManager.error('Something went wrong. Please refresh the page.');
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.app && window.app.toastManager) {
        window.app.toastManager.error('Network error occurred. Please try again.');
    }
    event.preventDefault();
});