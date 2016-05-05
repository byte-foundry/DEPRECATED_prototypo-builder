import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import SvgExpandedSkeleton from './SvgExpandedSkeleton';

import { getCalculatedNodes } from './../_utils';

import {
  renderPathData,
  mapDispatchToProps
} from './_utils';

class SvgContour extends Component {
  constructor(props) {
    super(props);
    this.renderPathData = renderPathData.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
  }

  renderChildren() {
    const { nodes, id } = this.props;
    const { childIds } = nodes[id];

    const result = childIds.map((pathId) => {
      return this.renderPathData(pathId);
    }).join(' ');
    return result;
  }

  renderExpandedSkeletons() {
    const { nodes, id } = this.props;
    const { childIds } = nodes[id];

    return (
      childIds
        .filter((pathId) => {
          return nodes[pathId].isSkeleton;
        })
        .map((pathId) => {
          return <SvgExpandedSkeleton key={pathId} id={pathId} parentId={id} />
        })
    );
  }

  render() {
    return (
      <g>
        <path className="contour" d={this.renderChildren()} />
        {this.renderExpandedSkeletons()}
      </g>
    );
  }
}

SvgContour.propTypes = {
  actions: PropTypes.object.isRequired
}

function mapStateToProps(state) {
  return { nodes: getCalculatedNodes(state.nodes, state.nodes['font-initial'].params) };
}

export default connect(mapStateToProps, mapDispatchToProps)(SvgContour);
