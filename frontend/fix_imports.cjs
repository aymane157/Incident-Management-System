const fs = require('fs');

function replace(file, from, to) {
  const content = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, content.replace(from, to));
}

replace('src/components/Sidebar.tsx', 'Home, LayoutDashboard, PlusCircle, Settings, Users, Briefcase, Activity', 'LayoutDashboard, PlusCircle, Settings, Activity');
replace('src/components/Topbar.tsx', 'Bell, Search, Command', 'Bell, Search');
replace('src/pages/ClientHome.tsx', 'ArrowUpRight, Clock, AlertCircle, CheckCircle2, MoreHorizontal', 'ArrowUpRight, MoreHorizontal');
replace('src/pages/CreateIncident.tsx', 'Upload, Sparkles, FileText, Bot', 'Upload, Sparkles, FileText');
replace('src/pages/IncidentWorkspace.tsx', "import { useState } from 'react';\nimport { motion } from 'framer-motion';\nimport { Search, Filter, MessageSquare, Paperclip, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';", "import { Search, CheckCircle, AlertTriangle, Send } from 'lucide-react';");
