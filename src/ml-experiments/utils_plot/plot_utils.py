import numpy as np
import matplotlib.pyplot as plot
from matplotlib.ticker import MaxNLocator
from matplotlib.gridspec import GridSpec
from matplotlib.colors import LinearSegmentedColormap

plot.style.use('./deeplearning.mplstyle')
dlblue = '#0096ff'
dlorange = '#FF9300'
dldarkred = '#C00000'
dlmagenta = '#FF40FF'
dlpurple = '#7030A0'
dlcolors = [dlblue, dlorange, dldarkred, dlmagenta, dlpurple]
dlc = dict(dlblue='#0096ff', dlorange='#FF9300', dldarkred='#C00000',
           dlmagenta='#FF40FF', dlpurple='#7030A0')


def plt_house_x(X, y, f_wb=None, ax=None):
    ''' plot house with aXis '''
    if not ax:
        fig, ax = plot.subplots(1, 1)
    ax.scatter(X, y, marker='x', c='r', label="Actual Value")

    ax.set_title("Housing Prices")
    ax.set_ylabel('Price (in 1000s of euros)')
    ax.set_xlabel(f'Size (m2)')

    if f_wb is not None:
        ax.plot(X, f_wb,  c=dlblue, label="Our Prediction")
    ax.legend()


def mk_cost_lines(x, y, w, b, ax):
    ''' makes vertical cost lines'''
    cstr = "cost = (1/m)*("
    ctot = 0
    label = 'cost for point'
    addedbreak = False

    for p in zip(x, y):
        f_wb_p = w*p[0]+b
        c_p = ((f_wb_p - p[1])**2)/2
        c_p_txt = c_p
        ax.vlines(p[0], p[1], f_wb_p, lw=3,
                  color=dlpurple, ls='dotted', label=label)
        label = ''  # just one
        cxy = [p[0], p[1] + (f_wb_p-p[1])/2]
        ax.annotate(f'{c_p_txt:0.0f}', xy=cxy, xycoords='data', color=dlpurple,
                    xytext=(5, 0), textcoords='offset points')
        cstr += f"{c_p_txt:0.0f} +"
        if len(cstr) > 38 and addedbreak is False:
            cstr += "\n"
            addedbreak = True
        ctot += c_p
    ctot = ctot/(len(x))
    cstr = cstr[:-1] + f") = {ctot:0.0f}"
    ax.text(0.15, 0.02, cstr, transform=ax.transAxes, color=dlpurple)
