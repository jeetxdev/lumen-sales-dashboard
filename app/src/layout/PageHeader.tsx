import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MagnifyingGlass, Moon, Sun } from '@phosphor-icons/react';
import type { Range } from '../api/types';
import { Seg } from '../components/controls';
import { useTheme } from '../theme/ThemeProvider';
import { useNavState } from '../routes';

export interface HeaderAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  tag?: { label: string; cls: string } | null;
  search?: { value: string; onChange: (v: string) => void; placeholder: string };
  range?: { value: Range; onChange: (r: Range) => void };
  action?: HeaderAction | null;
}

const RANGES: Range[] = ['30d', 'QTD', 'YTD'];

export function PageHeader({ title, subtitle, tag, search, range, action }: PageHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { back } = useNavState();
  const isDark = theme === 'dark';

  return (
    <header className="page-header">
      <div className="page-header__titles">
        {back && (
          <button type="button" className="btn btn-ghost back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft />
            {back}
          </button>
        )}
        <div className="page-header__subtitle">{subtitle}</div>
        <div className="page-header__title-row">
          <h2 className="page-header__title">{title}</h2>
          {tag && <span className={`tag ${tag.cls}`}>{tag.label}</span>}
        </div>
      </div>
      {search && (
        <div className="search">
          <MagnifyingGlass className="search__icon" />
          <input className="input search__input" type="search" placeholder={search.placeholder} value={search.value} onChange={(e) => search.onChange(e.target.value)} aria-label={search.placeholder} />
        </div>
      )}
      {range && <Seg label="Date range" value={range.value} onChange={range.onChange} options={RANGES.map((r) => ({ value: r, label: r }))} />}
      <button type="button" className="btn btn-secondary btn-icon" onClick={toggleTheme} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
        {isDark ? <Sun className="icon-16" /> : <Moon className="icon-16" />}
      </button>
      {action && (
        <button type="button" className="btn btn-primary" onClick={action.onClick}>
          {action.icon}
          {action.label}
        </button>
      )}
    </header>
  );
}
