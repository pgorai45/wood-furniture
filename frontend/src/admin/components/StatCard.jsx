import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBgClass = 'stat-icon-orange',
  onClick,
  style = {},
  valueStyle = {},
}) => {
  return (
    <div
      className="admin-stat-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div className="admin-stat-info">
        <h3>{title}</h3>
        <div className="stat-value" style={valueStyle}>
          {value}
        </div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
      {icon && <div className={`admin-stat-icon-wrapper ${iconBgClass}`}>{icon}</div>}
    </div>
  );
};

export default StatCard;
