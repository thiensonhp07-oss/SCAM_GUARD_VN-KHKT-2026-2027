#!/usr/bin/env python3
"""
Python script to generate a high-definition, multi-metric line graph SVG
analyzing the ML Benchmark data provided in the table.
"""

import math
import json
import os

# ML Benchmark Data
data = [
    {
        "model": "Rule-Based",
        "short_name": "Rule-Based",
        "accuracy": 74.2,
        "f1": 69.7,
        "roc_auc": 0.72,
        "brier": 0.22,
        "latency_ms": 1.2,
        "xai": "Rule Transparent"
    },
    {
        "model": "Logistic Reg",
        "short_name": "Logistic Reg",
        "accuracy": 81.6,
        "f1": 79.3,
        "roc_auc": 0.83,
        "brier": 0.16,
        "latency_ms": 3.8,
        "xai": "Feature Weights"
    },
    {
        "model": "Random Forest",
        "short_name": "Random Forest",
        "accuracy": 86.4,
        "f1": 84.9,
        "roc_auc": 0.89,
        "brier": 0.13,
        "latency_ms": 8.5,
        "xai": "Gini Importance"
    },
    {
        "model": "GBDT",
        "short_name": "GBDT",
        "accuracy": 89.2,
        "f1": 88.2,
        "roc_auc": 0.92,
        "brier": 0.10,
        "latency_ms": 12.4,
        "xai": "SHAP"
    },
    {
        "model": "Distil-Text NLP",
        "short_name": "Distil-Text",
        "accuracy": 91.5,
        "f1": 90.4,
        "roc_auc": 0.94,
        "brier": 0.08,
        "latency_ms": 45.0,
        "xai": "Attention/Token"
    },
    {
        "model": "Hybrid LLM Reasoning",
        "short_name": "Hybrid LLM",
        "accuracy": 96.8,
        "f1": 96.0,
        "roc_auc": 0.98,
        "brier": 0.04,
        "latency_ms": 380.0,
        "xai": "Chain-of-Thought"
    }
]

def generate_svg():
    width = 1200
    height = 750
    
    # Colors
    bg_color = "#0b0f19"
    card_bg = "#111827"
    grid_color = "#1f293d"
    text_main = "#f8fafc"
    text_muted = "#94a3b8"
    
    c_acc = "#22d3ee"    # Cyan
    c_f1 = "#a855f7"     # Purple
    c_auc = "#eab308"    # Gold
    c_brier = "#10b981"  # Emerald
    c_lat = "#f43f5e"    # Rose

    # Dimensions
    padding_x = 90
    padding_y = 90
    chart_w = 1020
    chart_h = 420
    
    min_val = 60.0
    max_val = 100.0

    def get_x(idx):
        return padding_x + (idx * (chart_w / (len(data) - 1)))

    def get_y(val):
        # Maps 60-100 to chart_h -> 0
        norm = (val - min_val) / (max_val - min_val)
        return padding_y + chart_h - (norm * chart_h)

    # Generate points
    acc_pts = [(get_x(i), get_y(d["accuracy"])) for i, d in enumerate(data)]
    f1_pts = [(get_x(i), get_y(d["f1"])) for i, d in enumerate(data)]
    auc_pts = [(get_x(i), get_y(d["roc_auc"] * 100)) for i, d in enumerate(data)]

    def make_path(pts):
        path = f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"
        for p in pts[1:]:
            path += f" L {p[0]:.1f} {p[1]:.1f}"
        return path

    def make_area_path(pts):
        path = f"M {pts[0][0]:.1f} {padding_y + chart_h}"
        for p in pts:
            path += f" L {p[0]:.1f} {p[1]:.1f}"
        path += f" L {pts[-1][0]:.1f} {padding_y + chart_h} Z"
        return path

    svg_lines = []
    svg_lines.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="100%" height="100%" style="background-color:{bg_color}; font-family: system-ui, -apple-system, sans-serif;">')
    
    # Definitions / Gradients
    svg_lines.append('''
    <defs>
        <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="#22d3ee" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="f1Grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#a855f7" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#a855f7" stop-opacity="0.0"/>
        </linearGradient>
        <linearGradient id="aucGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#eab308" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#eab308" stop-opacity="0.0"/>
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
    </defs>
    ''')

    # Header Card
    svg_lines.append(f'''
    <rect x="30" y="20" width="{width-60}" height="70" rx="16" fill="{card_bg}" stroke="#1e293b" stroke-width="1.5"/>
    <text x="50" y="50" fill="{text_main}" font-size="20" font-weight="800">PHÂN TÍCH DIỄN TIẾN HIỆU NĂNG MACHINE LEARNING (ML BENCHMARK LINE GRAPH)</text>
    <text x="50" y="72" fill="{text_muted}" font-size="13">So sánh Accuracy, F1-Score, ROC-AUC (%) và Độ trễ suy luận trên 6 kiến trúc mô hình</text>
    ''')

    # Main Chart Box
    svg_lines.append(f'''
    <rect x="{padding_x-30}" y="{padding_y-20}" width="{chart_w+60}" height="{chart_h+160}" rx="16" fill="{card_bg}" stroke="#1e293b" stroke-width="1.5"/>
    ''')

    # Grid Lines & Y-Axis Labels
    for y_val in range(60, 101, 10):
        y_pos = get_y(y_val)
        svg_lines.append(f'<line x1="{padding_x}" y1="{y_pos}" x2="{padding_x + chart_w}" y2="{y_pos}" stroke="{grid_color}" stroke-width="1" stroke-dasharray="4 4"/>')
        svg_lines.append(f'<text x="{padding_x - 12}" y="{y_pos + 4}" fill="{text_muted}" font-size="12" font-family="monospace" text-anchor="end">{y_val}%</text>')

    # Area Fills
    svg_lines.append(f'<path d="{make_area_path(acc_pts)}" fill="url(#accGrad)" />')

    # Metric Lines
    svg_lines.append(f'<path d="{make_path(f1_pts)}" fill="none" stroke="{c_f1}" stroke-width="3" stroke-dasharray="6 4" opacity="0.85" />')
    svg_lines.append(f'<path d="{make_path(auc_pts)}" fill="none" stroke="{c_auc}" stroke-width="3" stroke-dasharray="2 2" opacity="0.9" />')
    svg_lines.append(f'<path d="{make_path(acc_pts)}" fill="none" stroke="{c_acc}" stroke-width="4" filter="url(#glow)" />')

    # X-Axis Grid & Labels
    for i, d in enumerate(data):
        x_pos = get_x(i)
        svg_lines.append(f'<line x1="{x_pos}" y1="{padding_y}" x2="{x_pos}" y2="{padding_y + chart_h}" stroke="{grid_color}" stroke-width="1" stroke-dasharray="3 3"/>')
        
        # Model Name Label
        svg_lines.append(f'<text x="{x_pos}" y="{padding_y + chart_h + 28}" fill="{text_main}" font-size="12" font-weight="700" text-anchor="middle">{d["short_name"]}</text>')
        svg_lines.append(f'<text x="{x_pos}" y="{padding_y + chart_h + 46}" fill="{text_muted}" font-size="11" font-family="monospace" text-anchor="middle">Latency: {d["latency_ms"]}ms</text>')
        svg_lines.append(f'<text x="{x_pos}" y="{padding_y + chart_h + 64}" fill="{c_brier}" font-size="10" font-family="monospace" text-anchor="middle">Brier: {d["brier"]}</text>')

    # Data Points & Tooltip Labels
    for i, d in enumerate(data):
        # Accuracy Node
        ax, ay = acc_pts[i]
        svg_lines.append(f'<circle cx="{ax}" cy="{ay}" r="6" fill="{c_acc}" stroke="#0b0f19" stroke-width="2" filter="url(#glow)"/>')
        svg_lines.append(f'<text x="{ax}" y="{ay - 12}" fill="{c_acc}" font-size="12" font-weight="800" text-anchor="middle">{d["accuracy"]}%</text>')

        # F1 Node
        fx, fy = f1_pts[i]
        svg_lines.append(f'<circle cx="{fx}" cy="{fy}" r="4" fill="{c_f1}" stroke="#0b0f19" stroke-width="1.5"/>')
        
        # ROC-AUC Node
        ux, uy = auc_pts[i]
        svg_lines.append(f'<circle cx="{ux}" cy="{uy}" r="4" fill="{c_auc}" stroke="#0b0f19" stroke-width="1.5"/>')

    # Legend Block
    leg_x = padding_x
    leg_y = padding_y + chart_h + 90
    
    svg_lines.append(f'''
    <g transform="translate({leg_x}, {leg_y})">
        <!-- Accuracy Legend -->
        <line x1="0" y1="10" x2="30" y2="10" stroke="{c_acc}" stroke-width="4"/>
        <circle cx="15" cy="10" r="4" fill="{c_acc}"/>
        <text x="38" y="14" fill="{text_main}" font-size="12" font-weight="700">Accuracy (%)</text>

        <!-- F1 Score Legend -->
        <line x1="160" y1="10" x2="190" y2="10" stroke="{c_f1}" stroke-width="3" stroke-dasharray="5 3"/>
        <circle cx="175" cy="10" r="3" fill="{c_f1}"/>
        <text x="198" y="14" fill="{text_main}" font-size="12" font-weight="700">F1-Score (%)</text>

        <!-- ROC-AUC Legend -->
        <line x1="320" y1="10" x2="350" y2="10" stroke="{c_auc}" stroke-width="3" stroke-dasharray="2 2"/>
        <circle cx="335" cy="10" r="3" fill="{c_auc}"/>
        <text x="358" y="14" fill="{text_main}" font-size="12" font-weight="700">ROC-AUC (×100)</text>

        <!-- Brier Calibration Legend -->
        <rect x="490" y="4" width="12" height="12" rx="3" fill="{c_brier}"/>
        <text x="510" y="14" fill="{text_main}" font-size="12" font-weight="700">Brier Loss (Sai số hiệu chỉnh)</text>

        <!-- Latency Legend -->
        <rect x="730" y="4" width="12" height="12" rx="3" fill="{c_lat}"/>
        <text x="750" y="14" fill="{text_main}" font-size="12" font-weight="700">Độ trễ Latency (ms)</text>
    </g>
    ''')

    # Insights Footer Box
    svg_lines.append(f'''
    <rect x="30" y="{height-75}" width="{width-60}" height="55" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>
    <text x="50" y="{height-48}" fill="{c_acc}" font-size="12" font-weight="800">💡 NHẬN XÉT TRỌNG YẾU:</text>
    <text x="210" y="{height-48}" fill="{text_main}" font-size="12">• Mô hình <tspan font-weight="bold" fill="{c_acc}">Hybrid LLM Reasoning</tspan> đạt đỉnh hiệu năng với <tspan font-weight="bold" fill="{c_acc}">96.8% Accuracy</tspan> &amp; Brier loss cực thấp <tspan fill="{c_brier}">(0.04)</tspan>.</text>
    <text x="210" y="{height-30}" fill="{text_muted}" font-size="11">• Điểm cân bằng tối ưu giữa Tốc độ &amp; Độ chính xác (Sweet Spot) là <tspan fill="{c_f1}">Distil-Text NLP (91.5% Acc, 45ms)</tspan> và <tspan fill="#38bdf8">GBDT (89.2% Acc, 12.4ms)</tspan>.</text>
    ''')

    svg_lines.append('</svg>')
    
    svg_content = "\n".join(svg_lines)
    
    os.makedirs("public", exist_ok=True)
    with open("public/ml_benchmark_line_graph.svg", "w", encoding="utf-8") as f:
        f.write(svg_content)
    
    print("Successfully generated public/ml_benchmark_line_graph.svg")

if __name__ == "__main__":
    generate_svg()
