/**
 * TLRP Discord Bot Dashboard - Configuration
 */

const CONFIG = {
    // The URL of your bot's API endpoint
    // Change this to the actual URL where your bot API is running
    API_URL: 'https://your-replit-url.repl.co',
    
    // Local storage key for the API token
    AUTH_TOKEN_KEY: 'tlrp_dashboard_auth_token',
    
    // Discord-related colors
    COLORS: {
        PRIMARY: '#5865F2',    // Discord Blurple
        SUCCESS: '#43B581',    // Discord Green
        DANGER: '#F04747',     // Discord Red
        WARNING: '#FAA61A',    // Discord Yellow
        INFO: '#0099E1',       // Discord Blue
        SECONDARY: '#4F545C',  // Discord Grey
    },
    
    // Default embed color
    DEFAULT_EMBED_COLOR: '#5865F2',
    
    // Common emojis used for roles
    COMMON_EMOJIS: [
        '🎮', '🎯', '🎪', '🎭', '🎨', 
        '🏆', '🏅', '🎖️', '📱', '💻', 
        '🎬', '📺', '📷', '🎥', '🎧', 
        '🎵', '🎹', '🎺', '🎸', '🎻',
        '🚗', '🚓', '🚑', '🚒', '🏍️',
        '⚽', '🏀', '🏈', '⚾', '🎾',
        '👮', '👨‍🚒', '👨‍⚕️', '👩‍⚕️', '👨‍🔧',
        '🛠️', '🔧', '🔨', '⚒️', '🧰'
    ],
    
    // Maximum number of roles per menu
    MAX_ROLES_PER_MENU: 25,
    
    // Maximum number of fields per embed
    MAX_FIELDS_PER_EMBED: 25,
};