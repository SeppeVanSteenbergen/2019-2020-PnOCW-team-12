class Algebra {
  /**
   * Linear algebra code from https://github.com/jlouthan/perspective-transform/blob/master/dist/perspective-transform.js
   */

  static dim(x) {
    let y, z;
    if (typeof x === 'object') {
      y = x[0];
      if (typeof y === 'object') {
        z = y[0];
        if (typeof z === 'object') {
          return this.dim(x);
        }
        return [x.length, y.length];
      }
      return [x.length];
    }
    return [];
  }

  static _foreach2(x, s, k, f) {
    if (k === s.length - 1) {
      return f(x);
    }
    let i,
        n = s[k],
        ret = Array(n);
    for (i = n - 1; i >= 0; i--) {
      ret[i] = this._foreach2(x[i], s, k + 1, f);
    }
    return ret;
  }

  static cloneV(x) {
    let _n = x.length;
    let i,
        ret = Array(_n);

    for (i = _n - 1; i !== -1; --i) {
      ret[i] = x[i];
    }
    return ret;
  }

  static clone(x) {
    if (typeof x !== 'object') return x;
    let V = this.cloneV;
    let s = this.dim(x);
    return this._foreach2(x, s, 0, V);
  }

  static diag(d) {
    let i,
        i1,
        j,
        n = d.length,
        A = Array(n),
        Ai;
    for (i = n - 1; i >= 0; i--) {
      Ai = Array(n);
      i1 = i + 2;
      for (j = n - 1; j >= i1; j -= 2) {
        Ai[j] = 0;
        Ai[j - 1] = 0;
      }
      if (j > i) {
        Ai[j] = 0;
      }
      Ai[i] = d[i];
      for (j = i - 1; j >= 1; j -= 2) {
        Ai[j] = 0;
        Ai[j - 1] = 0;
      }
      if (j === 0) {
        Ai[0] = 0;
      }
      A[i] = Ai;
    }
    return A;
  }

  static rep(s, v, k) {
    if (typeof k === 'undefined') {
      k = 0;
    }
    let n = s[k],
        ret = Array(n),
        i;
    if (k === s.length - 1) {
      for (i = n - 2; i >= 0; i -= 2) {
        ret[i + 1] = v;
        ret[i] = v;
      }
      if (i === -1) {
        ret[0] = v;
      }
      return ret;
    }
    for (i = n - 1; i >= 0; i--) {
      ret[i] = this.rep(s, v, k + 1);
    }
    return ret;
  }

  static identity(n) {
    return this.diag(this.rep([n], 1));
  }

  static inv(a) {
    let s = this.dim(a),
        abs = Math.abs,
        m = s[0],
        n = s[1];
    let A = this.clone(a),
        Ai,
        Aj;
    let I = this.identity(m),
        Ii,
        Ij;
    let i, j, k, x;
    for (j = 0; j < n; ++j) {
      let i0 = -1;
      let v0 = -1;
      for (i = j; i !== m; ++i) {
        k = abs(A[i][j]);
        if (k > v0) {
          i0 = i;
          v0 = k;
        }
      }
      Aj = A[i0];
      A[i0] = A[j];
      A[j] = Aj;
      Ij = I[i0];
      I[i0] = I[j];
      I[j] = Ij;
      x = Aj[j];
      for (k = j; k !== n; ++k) Aj[k] /= x;
      for (k = n - 1; k !== -1; --k) Ij[k] /= x;
      for (i = m - 1; i !== -1; --i) {
        if (i !== j) {
          Ai = A[i];
          Ii = I[i];
          x = Ai[j];
          for (k = j + 1; k !== n; ++k) Ai[k] -= Aj[k] * x;
          for (k = n - 1; k > 0; --k) {
            Ii[k] -= Ij[k] * x;
            --k;
            Ii[k] -= Ij[k] * x;
          }
          if (k === 0) Ii[0] -= Ij[0] * x;
        }
      }
    }
    return I;
  }

  static dotMMsmall(x, y) {
    let i, j, k, p, q, r, ret, foo, bar, woo, i0;
    p = x.length;
    q = y.length;
    r = y[0].length;
    ret = Array(p);
    for (i = p - 1; i >= 0; i--) {
      foo = Array(r);
      bar = x[i];
      for (k = r - 1; k >= 0; k--) {
        woo = bar[q - 1] * y[q - 1][k];
        for (j = q - 2; j >= 1; j -= 2) {
          i0 = j - 1;
          woo += bar[j] * y[j][k] + bar[i0] * y[i0][k];
        }
        if (j === 0) {
          woo += bar[0] * y[0][k];
        }
        foo[k] = woo;
      }
      ret[i] = foo;
    }
    return ret;
  }

  static dotMV(x, y) {
    let p = x.length,
        i;
    let ret = Array(p),
        dotVV = this.dotVV;
    for (i = p - 1; i >= 0; i--) {
      ret[i] = dotVV(x[i], y);
    }
    return ret;
  }

  static dotVV(x, y) {
    let i,
        n = x.length,
        i1,
        ret = x[n - 1] * y[n - 1];
    for (i = n - 2; i >= 1; i -= 2) {
      i1 = i - 1;
      ret += x[i] * y[i] + x[i1] * y[i1];
    }
    if (i === 0) {
      ret += x[0] * y[0];
    }
    return ret;
  }

  static transpose(x) {
    let i,
        j,
        m = x.length,
        n = x[0].length,
        ret = Array(n),
        A0,
        A1,
        Bj;
    for (j = 0; j < n; j++) ret[j] = Array(m);
    for (i = m - 1; i >= 1; i -= 2) {
      A1 = x[i];
      A0 = x[i - 1];
      for (j = n - 1; j >= 1; --j) {
        Bj = ret[j];
        Bj[i] = A1[j];
        Bj[i - 1] = A0[j];
        --j;
        Bj = ret[j];
        Bj[i] = A1[j];
        Bj[i - 1] = A0[j];
      }
      if (j === 0) {
        Bj = ret[0];
        Bj[i] = A1[0];
        Bj[i - 1] = A0[0];
      }
    }
    if (i === 0) {
      A0 = x[0];
      for (j = n - 1; j >= 1; --j) {
        ret[j][0] = A0[j];
        --j;
        ret[j][0] = A0[j];
      }
      if (j === 0) {
        ret[0][0] = A0[0];
      }
    }
    return ret;
  }
}