import React from 'react';
import { Card } from '@fluentui/react-components';
import { motion } from 'framer-motion';
import styles from './DashboardPage.module.css';
import { useNavigate } from 'react-router-dom';

interface PopularServiceCardProps {
  service: any;
  index: number;
}

// Helper to convert a string to Title Case
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

const getTextColorForBackground = (bgColor: string): string => {
  // Use tokens for default colors
  const defaultBg = '#e5e7eb';
  const effectiveBgColor = bgColor || defaultBg;

  try {
    // Basic luminance check for hex colors (assumes #RRGGBB format)
    const color = effectiveBgColor.startsWith('#') ? effectiveBgColor.substring(1) : '808080';
    const rgb = parseInt(color, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma < 128 ? '#fff' : '#111827';
  } catch (e) {
    return '#111827';
  }
};


export default function PopularServiceCard({ service, index }: PopularServiceCardProps) {
  const color = service.color || '#e5e7eb';
  const textColor = getTextColorForBackground(color);
  const categories = Array.isArray(service.categories)
    ? service.categories.join(', ')
    : typeof service.categories === 'string'
      ? service.categories
      : '';

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/subscription', {
      state: {
        name: service.name,
        color: service.color,
        logo: service.logo,
        category: Array.isArray(service.categories)
          ? service.categories[0] || ''
          : typeof service.categories === 'string'
            ? service.categories
            : ''
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.5, ease: [0.1, 0.9, 0.2, 1] }}
      whileHover={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)' }}
      whileFocus={{ boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.05)' }}
      style={{ borderRadius: '0.5rem', overflow: 'visible', background: color }}
    >
      <Card onClick={handleClick} className={`${styles.fluentCard} shadow-sm fluent-card fluent-reveal-effect`} style={{ background: color, color: textColor, padding: '1.5rem', minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', cursor: 'pointer' }}>
        {/* Logo top right */}
        <div style={{ position: 'absolute', top: 18, right: 18, width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <img
            src={service.logo}
            alt={service.name + ' logo'}
            style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 8, background: 'transparent' }}
          />
        </div>
        {/* Subscription Name */}
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 10, color: textColor }}>{service.name}</div>
        {/* Categories */}
        <div style={{ fontSize: 14, color: textColor, opacity: 0.7, marginBottom: 0 }}>{Array.isArray(service.categories) ? service.categories.map((cat: string) => toTitleCase(cat)).join(', ') : toTitleCase(service.categories || '')}</div>
      </Card>
    </motion.div>
  );
}
