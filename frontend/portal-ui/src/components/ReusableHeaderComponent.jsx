/**********************************************************************************************************
 * @file        ReusableHeaderPage.jsx
 * @description Resuable Component to display same style Title/message across the pages in the System.
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
  * @created     2025-11-12
 * @version     v2.0.0
 **********************************************************************************************************/
import React from 'react';

function ReusableHeaderComponent(props) {

    console.log('props : ',props);
    return (
        <div style={{ lineHeight: '1' }}>
            <h6>{props.title}</h6>
            <span style={{ fontStyle: 'italic', fontSize: '12px', whiteSpace: 'pre-line'}}>{props.message}</span>
        </div>
    );
}

export default ReusableHeaderComponent;